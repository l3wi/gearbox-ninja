import { BigNumber, utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { generateNewHash } from '../../utils/opHash'
import { PoolData, TokenData } from '@gearbox-protocol/sdk'
import { isNumeric, nFormatter } from '../../utils/format'
import { ApproveButton } from '../../components/approvalButton'
import { useAssets, useWrapETH } from '../../hooks/useAssets'
import { unwrapTokenAddress, WSTETH_ADDRESS } from '../../config/tokens'
import {
  useTokenBalances,
  useTokensDataListWithETH
} from '../../hooks/useTokens'
import { PoolsState } from '../../store/pools/reducer'
import { syncReducer } from '../../store/sync/reducer'
import ExitButton from '../../components/exitButton'
import { SufficientAmountGuard } from '../../components/amountButton'

const depositLPDescription = `Deposit your assets to Gearbox 
protocol to earn yield. These assets will be lent out to Gearbox's 
Credit Accounts who pay a rate to borrow them. Deposit your assets 
and become a ninja today!`

const poolData = (
  symbol: string,
  pools: Record<string, PoolData>,
  tokens: Record<string, TokenData>,
  balances: any
) => {
  const token = Object.values(tokens).find(
    (item: TokenData) => item.symbol === symbol
  )
  const balance = balances[token.id]
  let pool: PoolData
  if (symbol === 'ETH') {
    const weth = Object.values(tokens).find(
      (item: TokenData) => item.symbol === 'WETH'
    )
    pool = Object.values(pools).find(
      (item: PoolData) =>
        item.underlyingToken.toLowerCase() === weth.address.toLowerCase()
    )
  } else {
    pool = Object.values(pools).find(
      (item: PoolData) =>
        item.underlyingToken.toLowerCase() === token.address.toLowerCase()
    )
  }

  return { symbol, token, pool, balance }
}

const Form = () => {
  const state = useSelector((state: RootState) => state)
  const [, balancesWithETH] = useTokenBalances()
  const tokensListWithETH = useTokensDataListWithETH()

  const { symbol, token, pool, balance } = poolData(
    state.form.symbol,
    state.pools.data,
    tokensListWithETH,
    balancesWithETH
  )
  const web3 = useSelector((state: RootState) => state.web3)

  const collateralAssetsState = useAssets([
    {
      balance: BigNumber.from(0),
      balanceView: '',
      token: unwrapTokenAddress(pool.underlyingToken)
    }
  ])

  const {
    assets: unwrappedCollateral,
    handlers: { handleChangeAmount }
  } = collateralAssetsState

  const [wrappedCollateral, ethAmount] = useWrapETH(unwrappedCollateral)

  const disableSubmit = () => {
    if (unwrappedCollateral[0].balance.gt(balance)) return true
    return false
  }

  const handleSubmit = () => {
    if (!pool || !web3.account || !token || !pool) return
    const opHash = generateNewHash('POOL-ADD-')
    store.dispatch(
      actions.pools.addLiquidity({
        pool,
        ethAmount,
        amount: unwrappedCollateral[0].balance,
        opHash
      })
    )
  }

  const exit = () => {
    store.dispatch(actions.form.toggleForm('', ''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  const updateValue = (input: string) => {
    const func = handleChangeAmount(0)
    if (isNumeric(input)) {
      const bn = utils.parseUnits(input, token.decimals)
      return func(bn, input.toString())
    }
    func(unwrappedCollateral[0].balance, input.toString())
  }

  return (
    <FormBg>
      <Underground>
        <ExitButton text="Back" func={exit} />
        <Row>
          <Content>
            <h2>{`Deposit ${symbol.toUpperCase()} to Gearbox`}</h2>
            <p>{depositLPDescription}</p>
          </Content>

          <FormContainer>
            <InputSuper>
              <span>{`DEPOSIT`}</span>
              <span>
                {`BALANCE: 
              ${nFormatter(balance, token.decimals, 3)} 
              ${symbol.toUpperCase()}`}
              </span>
            </InputSuper>
            <InputGroup>
              <Input
                value={unwrappedCollateral[0].balanceView}
                onChange={(e) => updateValue(e.target.value)}
              />
              <Asset>
                <img width={20} src={token.icon} />
                <span>{token.symbol.toUpperCase()}</span>
              </Asset>
              <MaxButton onClick={() => updateValue(balance.toString())}>
                max
              </MaxButton>
            </InputGroup>
            <APYGroup>
              <span>Deposit APY</span>
              <span>{pool?.depositAPY.toFixed(2)}%</span>
            </APYGroup>
            <SufficientAmountGuard
              amount={unwrappedCollateral[0].balance}
              balance={balance}
            >
              <ApproveButton
                assets={wrappedCollateral}
                to={
                  pool.underlyingToken === WSTETH_ADDRESS
                    ? web3.wstethGateway?.address
                    : pool.address
                }
              >
                <SubmitButton onClick={() => handleSubmit()}>
                  {disableSubmit() ? 'not enough' : 'deposit'}
                </SubmitButton>
              </ApproveButton>
            </SufficientAmountGuard>
          </FormContainer>
        </Row>
      </Underground>
    </FormBg>
  )
}

const APYGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
`

const Content = styled.div`
  max-width: 400px;
`

const Asset = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 6px 4px;
  min-width: 70px;
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
  margin-top: 0px;
  font-size: 18px;
  width: 100%;
  max-width: 300px;
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

const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 20%;
  /* justify-content: center; */
  align-items: center;
  min-width: 1023px;
  min-height: 512px;
  width: 100%;
  height: 100%;
  background-image: url('/data/img/underground.png');
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
const Row = styled.div`
  padding: 30px 50px;
  display: flex;
  background-image: url('/data/img/backboard.png');
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
`

export default Form
