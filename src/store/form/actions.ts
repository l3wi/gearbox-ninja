import { PoolData } from '@gearbox-protocol/sdk'
import { BigNumber, utils } from 'ethers'
import { store } from '../index'
import actions from '../actions'
import { FormThunkAction } from './index'
import { Token } from './reducer'

const depositLPDescription = `Deposit your assets to Gearbox 
protocol to earn yield. These assets will be lent out to Gearbox's 
Credit Accounts who pay a rate to borrow them. Deposit your assets 
and become a ninja today!`

export const toggleForm = (): FormThunkAction => async (dispatch, getState) => {
  const { isHidden } = getState().form
  if (isHidden) {
    document.getElementById('depositPage').style.visibility = 'visible'
    document.getElementById('depositPage').style.opacity = '1'
  } else {
    document.getElementById('depositPage').style.visibility = 'hidden'
    document.getElementById('depositPage').style.opacity = '0'
  }

  dispatch({ type: 'TOGGLE_FORM' })
}

export const populateForm =
  (
    symbol: string,
    token: any,
    pool: any,
    balance: BigNumber
  ): FormThunkAction =>
  async (dispatch, getState) => {
    const { tokens } = getState()

    // Fill out HTML Elements
    const title = 'Deposit ' + symbol.toUpperCase() + ' to Gearbox'
    document.getElementById('title').textContent = title
    document.getElementById('desc').textContent = depositLPDescription

    // approval conditional text. separates concerns 🙄 pls fix
    if (tokens.allowances[pool.underlyingToken + '@' + pool.address].eq(0)) {
      document.getElementById('submit').textContent = 'approve ' + symbol
    } else {
      document.getElementById('submit').textContent = 'deposit ' + symbol
    }

    const readableBalance = balance
      .div(BigNumber.from('10').pow(BigNumber.from(token.decimals)))
      .toNumber()

    document.getElementById('balance').textContent =
      'balance: ' +
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(readableBalance)

    dispatch({
      type: 'POPULATE_FORM',
      payload: {
        title,
        description: depositLPDescription,
        symbol,
        token,
        pool,
        balance
      }
    })
  }

export const handleSubmit =
  (): FormThunkAction => async (dispatch, getState) => {
    const { form, tokens, web3 } = getState()

    if (
      tokens.allowances[form.pool.underlyingToken + '@' + form.pool.address].eq(
        BigNumber.from(0)
      )
    ) {
      let listener: any
      const repopulate = () => {
        // Repopulate form
        const { allowances } = getState().tokens
        const { symbol, token, pool, balance } = getState().form
        if (
          !allowances[pool.underlyingToken + '@' + pool.address].eq(
            BigNumber.from(0)
          )
        ) {
          listener()
          console.log(listener)
          dispatch(actions.form.populateForm(symbol, token, pool, balance))
        }
      }
      //@ts-ignore
      listener = store.subscribe(repopulate)

      dispatch(
        actions.tokens.approveToken(
          form.pool.underlyingToken,
          form.pool.address,
          web3.account
        )
      )
    } else {
      dispatch(actions.form.sendTransaction())
    }
  }

export const sendTransaction =
  (): FormThunkAction => async (dispatch, getState) => {
    const { pool, isMax, value, balance, token } = getState().form
    let finalValue
    if (isMax) {
      finalValue = balance
    } else {
      finalValue = BigNumber.from(value).mul(
        BigNumber.from('10').pow(BigNumber.from(token.decimals))
      )
    }

    dispatch(actions.pools.addLiquidity(pool, finalValue))
  }

export const updateForm =
  (input: string): FormThunkAction =>
  async (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: {
        value: +input,
        isMax: false
      }
    })
  }

export const maxAmount = (): FormThunkAction => async (dispatch, getState) => {
  const { balance, token } = getState().form

  const value = balance
    .div(BigNumber.from('10').pow(BigNumber.from(token.decimals)))
    .toString()

  // Update input field
  document.querySelector('input').value = value

  dispatch({
    type: 'MAX_AMOUNT',
    payload: {
      value: +value,
      isMax: true
    }
  })
}
