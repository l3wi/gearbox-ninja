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
  useOpenStrategy
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

const getStrategy = (state: RootState) => {
  const { symbol } = state.form
  const strategy = Object.values(state.strategy.strategies).find((strat) =>
    strat.name.toLowerCase().includes(symbol)
  )
  return strategy
}
export type OpenStrategyModel = 'openStrategy' | 'selectToken' | 'selectPool'

const Form = () => {
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

  const strategy = getStrategy(state)
  const strategyCms = useStrategyCreditManagers(strategy, creditManagers)
  const [, balancesWithETH] = useTokenBalances()
  const tokensListWithETH = useTokensDataListWithETH()
  const prices = usePrices()

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
    // if (selected) handleSetModeOpen()
  }

  const handleChangePool = (address: string) => {
    setSelectedPool(address)
    // handleSetModeOpen()
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
  console.log(borrowedAsset, collateralAndBorrow)
  const strategyPath = useOpenStrategy(
    creditManager,
    collateralAndBorrow,
    lpTokenAddress
  )
  console.log(strategyPath)

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

  const [value, setValue] = useState('100')
  const [isMax, setMax] = useState(false)
  const [asset, setAsset] = useState<TokenData | null>(inputs[0])

  const [approved, setApproved] = useState(false)

  const updateValue = (input: string) => {
    if (!input || input.match(/^\d{1,}(\.\d{0,4})?$/)) {
      setValue(input)
    }
  }

  const readableBalance =
    asset && balances[asset.address]
      ? balances[asset.address]
          .div(BigNumber.from('10').pow(BigNumber.from(asset.decimals)))
          .toString()
      : '0'

  const max = () => {
    updateValue(readableBalance)
    setMax(true)
  }

  const disableSubmit = () => {
    if (parseFloat(value) > parseFloat(readableBalance)) return true
    return false
  }

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

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>✕</ExitButton>

        <FormContainer>
          <h2>
            {`Invest in ${symbol.toUpperCase()} `}
            <img
              width={30}
              src={`https://static.gearbox.fi/tokens/${symbol.toLowerCase()}.svg`}
            />
          </h2>
          <InputSuper>
            <span>{`DEPOSIT`}</span>
            <span>
              {`BALANCE: 
              ${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              }).format(parseFloat(readableBalance))} 
              ${asset.symbol.toUpperCase()}`}
            </span>
          </InputSuper>
          <InputGroup>
            <Input
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
            <Dropdown asset={asset} list={inputs} func={setAsset} />
            <MaxButton onClick={() => max()}>max</MaxButton>
          </InputGroup>
          <Group>
            <span>Borrowed Asset: </span>
            <Asset>
              <img
                width={20}
                src={`https://static.gearbox.fi/tokens/${collateral.symbol.toLowerCase()}.svg`}
              />
              <span>{collateral.symbol.toUpperCase()}</span>
            </Asset>
          </Group>
          <Group>
            <Slider min={0} max={9} value={leverage} func={setLeverage} />
          </Group>
          <Group>
            <span>You'll recieve</span>
            <span>{`${
              parseFloat(value) * leverage
            } ${collateral.symbol.toUpperCase()}`}</span>
          </Group>
          <Group>
            <span>Strategy APY</span>
            <span>{100}%</span>
          </Group>
          <SubmitButton
            disabled={disableSubmit()}
            onClick={() => handleSubmit()}
          >
            {disableSubmit() ? 'Insufficent Balance' : 'deposit'}
          </SubmitButton>
        </FormContainer>
        <span />
      </Underground>
    </FormBg>
  )
}

const Dropdown: React.FC<{
  asset: TokenData
  list: Array<TokenData>
  func: any
}> = ({ asset, list, func }) => {
  const [isOpen, setOpen] = useState(false)

  const select = (item: TokenData) => {
    func(item)
    setOpen(!isOpen)
  }

  return (
    <div>
      <Row onClick={() => setOpen(!isOpen)}>
        <Asset>
          {asset && (
            <>
              <img
                width={20}
                src={`https://static.gearbox.fi/tokens/${asset.symbol.toLowerCase()}.svg`}
              />
              <span>{asset.symbol.toUpperCase()}</span>
            </>
          )}
        </Asset>
        <Down>⌄</Down>
      </Row>
      <Col>
        {isOpen &&
          list.map((item) => (
            <Asset key={item.address} onClick={() => select(item)}>
              <img
                width={20}
                src={`https://static.gearbox.fi/tokens/${item.symbol.toLowerCase()}.svg`}
              />
              <span>{item.symbol.toUpperCase()}</span>
            </Asset>
          ))}
      </Col>
    </div>
  )
}

const Group = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
  width: 100%;
`

const Content = styled.div`
  max-width: 400px;
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
  width: 130px;
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
  margin-top: 65px;
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
  z-index: 50;
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
  justify-content: space-around;
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
  height: 100%;
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
