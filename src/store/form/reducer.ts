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
  token: Token
}

const initialState: FormState = {
  isHidden: true,
  isMax: false,
  value: 0,
  title: '',
  description: '',
  symbol: '',
  balance: BigNumber.from(0),
  token: {
    address: '',
    decimals: 6,
    icon: '',
    id: '',
    symbol: ''
  }
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
        balance: action.payload.balance
      }
    case 'UPDATE_FORM':
      return {
        ...state,
        value: action.payload.value
      }
  }

  return state
}
