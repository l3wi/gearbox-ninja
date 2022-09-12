import { PoolData } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'
import { FormActions } from './index'

export interface FormState {
  isHidden: boolean
  symbol: string
  type: string
}

const initialState: FormState = {
  isHidden: true,
  symbol: '',
  type: ''
}

export function formReducer(
  state: FormState = initialState,
  action: FormActions
): FormState {
  switch (action.type) {
    case 'TOGGLE_FORM':
      return {
        ...state,
        isHidden: !state.isHidden,
        symbol: action.payload.symbol,
        type: action.payload.type
      }
  }

  return state
}
