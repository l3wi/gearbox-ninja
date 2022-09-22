import { BigNumber } from 'ethers'
import styled from 'styled-components'
import React, { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { STRATEGY_UPDATE_DELAY } from '../../config'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { generateNewHash } from '../../utils/opHash'
import { lpTokenDataList } from '../../config/tokens'
import { wethToETH } from '../../config/tokens'
import { TokenData, LEVERAGE_DECIMALS } from '@gearbox-protocol/sdk'
import Slider from './slider'
import {
  useStrategy,
  useMaxLeverage,
  useStrategyCreditManagers,
  useStrategyList,
  useOpenStrategy,
  useAPYList
} from '../../hooks/useStrategy'
import {
  useTokenBalances,
  useTokensDataList,
  useTokensDataListWithETH
} from '../../hooks/useTokens'
import { usePrices } from '../../hooks/usePrices'
import {
  useAllowedTokensWithETH,
  useCreditManagers
} from '../../hooks/useCreditManagers'
import { canSelect, useTokenSelect } from '../../hooks/useTokenSelect'
import {
  useAssets,
  useSingleAsset,
  useSumAssets,
  useWrapETH
} from '../../hooks/useAssets'
import {
  useLeveragedAmount,
  useTotalAmountInTarget
} from '../../hooks/useOpenAccount'
import { EMPTY_ARRAY } from '../../config/constants'
import { useHF } from '../../hooks/useHF'
// import { useValidateOpenStrategy } from '../../hooks/useValidate'
import { useOverallAPY } from '../../hooks/useCreditAccounts'
import Picker from './picker'
import { AssetWithView } from '../../config/asset'
import { nFormatter } from '../../utils/format'

const getStrategy = (state: RootState) => {
  const { symbol } = state.form
  const strategy = Object.values(state.strategy.strategies).find((strat) =>
    strat.name.toLowerCase().includes(symbol)
  )
  return strategy
}
export type OpenStrategyModel = 'openStrategy' | 'selectToken' | 'selectPool'

const Form = () => {
  const [picker, setPicker] = useState(false)

  const dispatch = useDispatch()
  const {
    mode,
    indexToChange,
    handlers: { handleSetAnotherMode, handleSetModeSelect }
  } = useTokenSelect<OpenStrategyModel>('openStrategy')
  const [strategies, creditManagers] = useStrategyList()
  const tokensList = useTokensDataList()

  const state = useSelector((state: RootState) => state)
  const { provider } = useSelector((state: RootState) => state.web3)
  const { tokens, form } = state
  const { balances, allowances } = tokens
  const { symbol } = form

  const [, balancesWithETH] = useTokenBalances()
  const tokensListWithETH = useTokensDataListWithETH()
  const prices = usePrices()

  const strategy = getStrategy(state)
  const strategyCms = useStrategyCreditManagers(strategy, creditManagers)

  const availablePools = useMemo(() => Object.keys(strategyCms), [strategyCms])
  const [selectedPool, setSelectedPool] = useState(availablePools[0])

  const creditManager = creditManagers[selectedPool]
  const { underlyingToken: cmUnderlyingToken } = creditManager || {}
  const allowedTokens = useAllowedTokensWithETH(creditManager)
  const collateralAssetsState = useAssets([
    {
      balance: BigNumber.from(0),
      balanceView: '',
      token: wethToETH(cmUnderlyingToken || '')
    }
  ])

  const maxLeverage =
    useMaxLeverage(strategy.lpToken.toLowerCase(), strategyCms) +
    LEVERAGE_DECIMALS

  const handleTokenSelect = (address: string) => {
    const selected = canSelect(address, collateralAssetsState.assets, balances)

    if (selected && indexToChange !== null)
      collateralAssetsState.handlers.handleChangeToken(indexToChange)(address)
  }

  const handleChangePool = (address: string) => {
    setSelectedPool(address)
  }

  const isLoading = !creditManager

  /// OPEN STRAT DIALOG
  const {
    address: cmAddress,
    borrowRate,
    minAmount,
    maxAmount,
    underlyingToken: underlyingTokenAddress,
    liquidationThresholds
  } = creditManager
  const { lpToken: lpTokenAddress, apy, baseAssets } = strategy
  const underlyingToken = tokensList[underlyingTokenAddress]
  const { symbol: underlyingSymbol } = underlyingToken || {}

  const lpToken = tokensList[lpTokenAddress]
  const { symbol: lpSymbol = '' } = lpToken || {}

  const {
    assets: unwrappedCollateral,
    handlers: { handleAdd, handleChangeAmount, handleRemove }
  } = collateralAssetsState
  const [wrappedCollateral, ethAmount] = useWrapETH(unwrappedCollateral)

  const maxLeverageFactor = useMaxLeverage(lpTokenAddress, creditManager)
  const [leverage, setLeverage] = useState(
    maxLeverageFactor + LEVERAGE_DECIMALS
  )
  const totalAmount = useTotalAmountInTarget({
    assets: wrappedCollateral,
    prices,
    targetToken: underlyingToken,
    tokensList
  })

  const [amountOnAccount, borrowedAmount] = useLeveragedAmount(
    totalAmount,
    leverage
  )

  const borrowedAsset = useSingleAsset(underlyingTokenAddress, borrowedAmount)
  const collateralAndBorrow = useSumAssets(wrappedCollateral, borrowedAsset)

  const strategyPath = useOpenStrategy(
    creditManager,
    collateralAndBorrow,
    lpTokenAddress
  )
  const assetsAfterOpen = strategyPath?.balances || EMPTY_ARRAY
  const hfFrom =
    useHF({
      assets: assetsAfterOpen,
      prices,
      liquidationThresholds,
      underlyingToken: underlyingTokenAddress,
      borrowed: borrowedAmount
    }) || 0

  // const errString = useValidateOpenStrategy({
  //   balances,
  //   assets: unwrappedCollateral,
  //   tokensList,
  //   cm: creditManager,
  //   amount: totalAmount,
  //   debt: borrowedAmount,

  //   strategyPath,

  //   hf: hfFrom
  // })

  const apyList = useAPYList()
  const overallAPYFrom =
    useOverallAPY({
      caAssets: assetsAfterOpen,
      lpAPY: apyList,
      prices,

      totalValue: amountOnAccount,
      debt: borrowedAmount,
      borrowRate,
      underlyingToken: underlyingTokenAddress
    }) || 0

  const lpAmount = useMemo(() => {
    return (
      assetsAfterOpen.find(({ token }) => token === lpTokenAddress)?.balance ||
      BigNumber.from(0)
    )
  }, [lpTokenAddress, assetsAfterOpen])

  console.log(lpAmount, hfFrom)

  const liquidationPrice = strategy.liquidationPrice({
    assets: wrappedCollateral,
    prices,
    liquidationThresholds,

    borrowed: borrowedAmount,
    underlyingToken: underlyingTokenAddress,

    lpAmount,
    lpToken: lpTokenAddress
  })

  const liquidationAssets = useLiquidationAssets(
    baseAssets,
    underlyingTokenAddress,
    tokensList
  )

  // const totalAmountFormatted = tokenTemplate(totalAmount, underlyingToken);
  const allAssetsSelected = allowedTokens.length === wrappedCollateral.length

  ///// OLD
  const inputs = strategy?.baseAssets.map((addr) => {
    return Object.values(state.tokens.details).find(
      (item: TokenData) => item.address === addr
    )
  })
  const collateral = Object.values(state.tokens.details).find(
    (item: TokenData) => item.address === strategy.leveragableCollateral[0]
  )

  const [isMax, setMax] = useState(false)
  const [asset, setAsset] = useState<TokenData | null>(inputs[0])

  const [approved, setApproved] = useState(false)

  // const updateValue = (input: string) => {
  //   if (!input || input.match(/^\d{1,}(\.\d{0,4})?$/)) {
  //     setValue(input)
  //   }
  // }

  // const readableBalance =
  //   asset && balances[asset.address]
  //     ? balances[asset.address]
  //         .div(BigNumber.from('10').pow(BigNumber.from(asset.decimals)))
  //         .toString()
  //     : '0'

  // const max = () => {
  //   updateValue(readableBalance)
  //   setMax(true)
  // }

  const handleSubmit = () => {}
  // const handleOpenClick: OpenStrategyManagerProps["onOpenClick"] = props => {
  //   const opHash = generateNewHash("OAS-ACT-");
  //   dispatch(actions.strategy.openStrategy({ ...props, opHash }));
  // };

  // const maxLeverage = useMaxLeverage(lpToken, strategyCms) + LEVERAGE_DECIMALS;

  const exit = () => {
    store.dispatch(actions.form.toggleForm('', ''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  useEffect(() => {
    //need to fetch pool id
    // if (
    //   strategy &&
    //   !allowances[strategy.underlyingToken + '@' + pool.address].eq(
    //     BigNumber.from(0)
    //   )
    // ) {
    //   setApproved(true)
    // }
  }, [allowances])

  // Fetch APYs
  useEffect(() => {
    let timer: number | null = null

    if (provider && Object.keys(prices).length > 0) {
      const apyTask = () => {
        //@ts-ignore
        dispatch(actions.strategy.getApy(provider, prices, lpTokenDataList))
      }

      apyTask()
      timer = window.setInterval(apyTask, STRATEGY_UPDATE_DELAY)
    }

    return function apyCleanup() {
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, prices])

  // Reset Picker on select
  useEffect(() => {
    setPicker(false)
  }, [unwrappedCollateral])

  // index 0
  const updateValue = (index: number, input: string) => {
    const func = handleChangeAmount(index)
    const token = tokensList[unwrappedCollateral[0].token]
    if (!input || input.match(/^\d{1,}(\.\d{0,4})?$/)) {
      const bn = BigNumber.from(input).mul(
        BigNumber.from('10').pow(BigNumber.from(token.decimals))
      )
      func(bn, input.toString())
    }
  }

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>✕</ExitButton>
        <h1>
          {`Invest in ${symbol.toUpperCase()} `}
          <img
            width={30}
            src={`https://static.gearbox.fi/tokens/${symbol.toLowerCase()}.svg`}
          />
        </h1>
        <Row>
          <FormContainer>
            <h3>Deposit Assets</h3>
            {unwrappedCollateral.map((collateral, i) => {
              return (
                <Section>
                  <InputSuper>
                    <span>
                      {`BALANCE: 
                        ${nFormatter(
                          balances[collateral.token],
                          tokensList[collateral.token].decimals,
                          3
                        )} 
                        ${
                          tokensList[collateral.token] &&
                          tokensList[collateral.token].symbol.toUpperCase()
                        }`}
                    </span>
                    <span />
                  </InputSuper>
                  <InputGroup>
                    <Input
                      placeholder="0.0"
                      value={collateral.balanceView}
                      onChange={(e) => updateValue(i, e.target.value)}
                    />

                    <Asset>
                      <>
                        <img
                          width={20}
                          src={tokensList[collateral.token].icon}
                        />
                        <span>
                          {tokensList[collateral.token].symbol.toUpperCase()}
                        </span>
                      </>
                    </Asset>
                    <MaxButton
                      onClick={() =>
                        updateValue(i, balances[collateral.token].toString())
                      }
                    >
                      max
                    </MaxButton>
                  </InputGroup>
                </Section>
              )
            })}

            <Group>
              <>
                <PickerButton onClick={() => setPicker(true)}>
                  add asset
                </PickerButton>
                {picker && (
                  <Picker
                    selected={unwrappedCollateral}
                    tokensList={tokensList}
                    balances={balancesWithETH}
                    allowedTokens={allowedTokens}
                    addAsset={handleAdd}
                  />
                )}
              </>
            </Group>
            <Group>
              <span>Borrowed Asset: </span>
              <Asset>
                <img
                  width={20}
                  src={`https://static.gearbox.fi/tokens/${underlyingToken.symbol.toLowerCase()}.svg`}
                />
                <span>{underlyingToken.symbol.toUpperCase()}</span>
              </Asset>
            </Group>
          </FormContainer>
          <FormContainer>
            <Group>
              <Slider
                amount={totalAmount}
                minAmount={minAmount}
                maxAmount={maxAmount}
                leverage={leverage}
                maxLeverage={maxLeverageFactor}
                setLeverage={setLeverage}
              />
            </Group>
            <Group>
              <span>You'll recieve</span>
              <span>{`${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              }).format(
                parseFloat(
                  lpAmount
                    .div(BigNumber.from('10').pow(BigNumber.from(18)))
                    .toString()
                )
              )} ${lpSymbol.toUpperCase()}`}</span>
            </Group>
            <Group>
              <span>Strategy APY</span>
              <span>{overallAPYFrom}%</span>
            </Group>
            <Group>
              <span>Health Factor</span>
              <span>{hfFrom / 10000}</span>
            </Group>
            <SubmitButton
              // disabled={disableSubmit()}
              onClick={() => handleSubmit()}
            >
              {true ? 'Insufficent Balance' : 'deposit'}
            </SubmitButton>
          </FormContainer>
        </Row>
      </Underground>
    </FormBg>
  )
}

function useLiquidationAssets(
  assets: Array<string>,
  underlyingToken: string,
  tokensList: Record<string, TokenData>
): Array<string> {
  const liquidationAssets = useMemo(
    () =>
      assets
        .filter((address) => address !== underlyingToken)
        .map((address) => {
          const { symbol } = tokensList[address] || {}

          return symbol
        })
        .filter((symbol) => symbol),
    [assets, underlyingToken, tokensList]
  )
  return liquidationAssets
}

const Group = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
  width: 100%;
`

const PickerButton = styled.button`
  width: 100%;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  padding: 15px 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 15px;
  margin: 0px;
  font-family: 'Press Start 2P';
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: 0.1s ease-in-out;
  &:hover {
    border: 2px solid rgba(255, 255, 255, 1);
    color: rgba(255, 255, 255, 1);
  }
`

const Section = styled.div`
  padding: 10px 0px;
`

const InputSuper = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 2px solid white;
  /* padding: 3px 2px; */
  box-sizing: border-box;
  height: 45px;
`

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  color: white;
  width: 150px;
  padding: 5px 8px 0px;
  font-size: 18px;
`

const MaxButton = styled.div`
  background: transparent;
  color: white;
  border: none;
  font-size: 18px;
  padding: 4px 6px;
  text-align: center;
  font-family: 'Press Start 2P';
  border-left: 2px solid white;
  display: flex;
  align-items: center;
`

const FormContainer = styled.div`
  font-size: 18px;
  width: 100%;
  max-width: 350px;
  padding: 20px;
`

const SubmitButton = styled.button`
  width: 100%;
  background: gray;
  border: none;
  color: white;
  padding: 15px 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 20px;
  margin: 0px;
  font-family: 'Press Start 2P';
`

const ExitButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  border: none;
  background: none;
  color: white;
  font-size: x-large;
`
// BG

const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 1023px;
  min-height: 512px;
  width: 100%;
  height: 100%;
  background-image: url('/data/img/form_bg.png');
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
`

const FormBg = styled.div`
  height: 100%;
  width: 100%;
  background: #070b13;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Asset = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0px 6px;
  min-width: 70px;
  height: 45px;
  width: 70px;
`
const Down = styled.span`
  margin-bottom: 0.5rem;
`
const Row = styled.span`
  display: flex;
  align-items: center;
`
const Col = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #070b13;
  z-index: 200;
`

export default Form
