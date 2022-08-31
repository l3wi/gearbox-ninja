import { BigNumber } from 'ethers'
import { store } from '../index'
import actions from '../actions'
import { FormThunkAction } from './index'

const depositLPDescription = `Deposit your assets to Gearbox 
protocol to earn yield. These assets will be lent out to Gearbox's 
Credit Accounts who pay a rate to borrow them. Deposit your assets 
and become a ninja today!`

export const toggleForm = (): FormThunkAction => async (dispatch, getState) => {
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
    const title = 'Stake ' + symbol.toUpperCase() + ' to Gearbox'

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
    .div(BigNumber.from('10').pow(BigNumber.from(token?.decimals)))
    .toString()

  dispatch({
    type: 'MAX_AMOUNT',
    payload: {
      value: +value,
      isMax: true
    }
  })
}
