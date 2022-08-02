import { PoolData } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'
import { FormActions } from './index'

export interface Token {
  address: string
  decimals: number
  icon: string
  id: string
  symbol: string
}

export interface FormState {
  isHidden: boolean
  isMax: boolean
  value: number
  title: string
  description: string
  symbol: string
  balance: BigNumber
  token?: Token
  pool?: PoolData
}

const initialState: FormState = {
  isHidden: true,
  isMax: false,
  value: 0,
  title: '',
  description: '',
  symbol: '',
  balance: BigNumber.from(0)
}

export function formReducer(
  state: FormState = initialState,
  action: FormActions
): FormState {
  switch (action.type) {
    case 'TOGGLE_FORM':
      return {
        ...state,
        isHidden: !state.isHidden
      }
    case 'CLEAR_FORM':
      return {
        ...state
      }
    case 'POPULATE_FORM':
      return {
        ...state,
        title: action.payload.title,
        description: action.payload.description,
        symbol: action.payload.symbol,
        token: action.payload.token,
        balance: action.payload.balance,
        pool: action.payload.pool
      }
    case 'UPDATE_FORM':
      return {
        ...state,
        value: action.payload.value
      }
    case 'MAX_AMOUNT':
      return {
        ...state,
        value: action.payload.value,
        isMax: true
      }
  }

  return state
}
