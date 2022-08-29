import { BigNumber } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'

const Form = () => {
  const allowances = useSelector((state: RootState) => state.tokens.allowances)
  const web3 = useSelector((state: RootState) => state.web3)
  const form = useSelector((state: RootState) => state.form)

  const [value, setValue] = useState('0')
  const [approved, setApproved] = useState(
    form.pool
      ? !allowances[form.pool.underlyingToken + '@' + form.pool.address].eq(
          BigNumber.from(0)
        )
      : false
  )

  const { pool, isMax, balance, token, symbol, title, description } = form

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
    store.dispatch(actions.form.maxAmount())
  }

  const disableSubmit = () => {
    if (parseFloat(value) > readableBalance) return true
    return false
  }

  const handleSubmit = () => {
    if (!approved) {
      store.dispatch(
        actions.tokens.approveToken(
          form.pool.underlyingToken,
          form.pool.address,
          web3.account
        )
      )
    } else {
      let finalValue
      if (isMax) {
        finalValue = balance
      } else {
        finalValue = BigNumber.from(
          parseFloat(value) * Math.pow(10, token.decimals)
        )
      }
      store.dispatch(actions.pools.addLiquidity(pool, finalValue))
    }
  }

  const exit = () => {
    store.dispatch(actions.form.toggleForm())
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  useEffect(() => {
    // Check if approved

    if (
      !allowances[form.pool.underlyingToken + '@' + form.pool.address].eq(
        BigNumber.from(0)
      )
    ) {
      console.log('Approved')
      setApproved(true)
    }
  }, [allowances])

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>✕</ExitButton>

        <Content>
          <h2>{title}</h2>
          <p>{description}</p>
        </Content>

        <FormContainer>
          <InputSuper>
            <span>depost</span>
            <span>
              BALANCE:{'  '}
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              }).format(readableBalance)}{' '}
              {symbol.toUpperCase()}
            </span>
          </InputSuper>
          <InputGroup>
            <Input
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
            <span id="ticker">
              <img
                width={20}
                id="tickerimg"
                src={`https://static.gearbox.fi/tokens/${symbol.toLowerCase()}.svg`}
              />
              <span id="tickersymbol">{symbol.toUpperCase()}</span>
            </span>
            <MaxButton onClick={() => max()}>max</MaxButton>
          </InputGroup>
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

const Content = styled.div`
  max-width: 400px;
`

const InputSuper = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  text-transform: uppercase;
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
  height: 40px;
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
  /* width: 50px; */
  font-size: 15px;
  padding: 3px 5px;
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
  margin: 15px 0px;
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
