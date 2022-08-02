import { PoolData } from '@gearbox-protocol/sdk'
import { BigNumber, utils } from 'ethers'
import actions from '../actions'
import { FormThunkAction } from './index'
import { Token } from './reducer'

export const toggleForm = (): FormThunkAction => async (dispatch, getState) => {
  const { isHidden } = getState().form
  if (isHidden) {
    //@ts-ignore
    document.getElementById('depositPage').style.visibility = 'visible'
  } else {
    //@ts-ignore
    document.getElementById('depositPage').style.visibility = 'hidden'
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
    const { isHidden } = getState().form
    const title = 'Deposit ' + symbol.toUpperCase() + ' to Gearbox'
    const description = ` Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in
    risus facilisis, tempor metus tincidunt, interdum sem. Ut varius,
    tortor tincidunt fermentum scelerisque, urna augue tincidunt arcu,
    viverra rhoncus tortor erat nec eros.`

    const readableBalance = balance
      .div(BigNumber.from('10').pow(BigNumber.from(token.decimals)))
      .toNumber()

    document.getElementById('title').textContent = title
    document.getElementById('desc').textContent = description
    document.getElementById('submit').textContent = 'deposit ' + symbol
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
        description,
        symbol,
        token,
        pool,
        balance
      }
    })
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
