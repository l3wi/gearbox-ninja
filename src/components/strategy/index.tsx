import { BigNumber } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { generateNewHash } from '../../utils/opHash'
import { PoolData, TokenData } from '@gearbox-protocol/sdk'

const depositLPDescription = `Deposit your assets to Gearbox 
protocol to earn yield. These assets will be lent out to Gearbox's 
Credit Accounts who pay a rate to borrow them. Deposit your assets 
and become a ninja today!`

const poolData = (symbol: string, state: RootState) => {
  const { pools, tokens } = state
  let token: any
  if (symbol === 'eth') {
    token = Object.values(tokens.details).find(
      (item: TokenData) => item.symbol === 'WETH'
    )
  } else {
    token = Object.values(tokens.details).find(
      (item: TokenData) => item.symbol === symbol
    )
  }
  const balance = tokens.balances[token.id]
  const pool = Object.values(pools.data).find(
    (item: PoolData) =>
      item.underlyingToken.toLowerCase() === token.address.toLowerCase()
  )
  return { symbol, token, pool, balance }
}

const Form = () => {
  const state = useSelector((state: RootState) => state)
  const { symbol, token, pool, balance } = poolData(state.form.symbol, state)

  const allowances = useSelector((state: RootState) => state.tokens.allowances)
  const web3 = useSelector((state: RootState) => state.web3)
  const form = useSelector((state: RootState) => state.form)

  const [value, setValue] = useState('0')
  const [isMax, setMax] = useState(false)
  const [approved, setApproved] = useState(
    pool
      ? !allowances[pool.underlyingToken + '@' + pool.address].eq(
          BigNumber.from(0)
        )
      : false
  )

  const readableBalance = balance
    .div(BigNumber.from('10').pow(BigNumber.from(token?.decimals)))
    .toNumber()

  const updateValue = (input: string) => {
    if (!input || input.match(/^\d{1,}(\.\d{0,4})?$/)) {
      setValue(input)
    }
  }

  const max = () => {
    const value = balance
      .div(BigNumber.from('10').pow(BigNumber.from(token?.decimals)))
      .toString()
    updateValue(value)
    setMax(true)
  }

  const disableSubmit = () => {
    if (parseFloat(value) > readableBalance) return true
    return false
  }

  const handleSubmit = () => {
    if (!pool || !web3.account || !token || !pool) return
    if (!approved) {
      const opHash = generateNewHash('APPROVE-')

      store.dispatch(
        actions.tokens.approveToken({
          tokenAddress: pool?.underlyingToken,
          to: pool?.address,
          account: web3.account,
          opHash
        })
      )
    } else {
      let finalValue
      if (isMax) {
        finalValue = balance
      } else {
        finalValue = BigNumber.from(
          (parseFloat(value) * Math.pow(10, token.decimals)).toString()
        )
      }
      store.dispatch(actions.pools.addLiquidity(pool, finalValue))
    }
  }

  const exit = () => {
    store.dispatch(actions.form.toggleForm(''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  useEffect(() => {
    if (
      pool &&
      !allowances[pool.underlyingToken + '@' + pool.address].eq(
        BigNumber.from(0)
      )
    ) {
      setApproved(true)
    }
  }, [allowances])

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>✕</ExitButton>

        <Content>
          <h2>{`Stake ${symbol.toUpperCase()} to Gearbox`}</h2>
          <p>{depositLPDescription}</p>
        </Content>

        <FormContainer>
          <InputSuper>
            <span>{`STAKE d${symbol.toUpperCase()}`}</span>
            <span>
              {`BALANCE: 
              ${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              }).format(readableBalance)} 
              ${symbol.toUpperCase()}`}
            </span>
          </InputSuper>
          <InputGroup>
            <Input
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
            <Asset>
              <img
                width={20}
                src={`https://static.gearbox.fi/tokens/${symbol.toLowerCase()}.svg`}
              />
              <span>{symbol.toUpperCase()}</span>
            </Asset>
            <MaxButton onClick={() => max()}>max</MaxButton>
          </InputGroup>
          <APYGroup>
            <span>Deposit APY</span>
            <span>{pool?.depositAPY.toFixed(2)}%</span>
          </APYGroup>
          <SubmitButton
            disabled={disableSubmit()}
            onClick={() => handleSubmit()}
          >
            {approved
              ? disableSubmit()
                ? 'not enough'
                : 'deposit'
              : 'approve'}
          </SubmitButton>
        </FormContainer>
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
  margin-top: 65px;
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

export default Form
