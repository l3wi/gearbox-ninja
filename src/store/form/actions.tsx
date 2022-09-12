import { BigNumber } from 'ethers'
import { store } from '../index'
import actions from '../actions'
import { FormThunkAction } from './index'

export const toggleForm =
  (symbol: string, type: string): FormThunkAction =>
  async (dispatch, getState) => {
    dispatch({ type: 'TOGGLE_FORM', payload: { symbol, type } })
  }
