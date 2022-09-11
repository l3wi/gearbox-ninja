/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { CreditManagerData } from '@gearbox-protocol/sdk'

import { AdapterManager } from '../../config/adapterManager'
import type { CreditManagerAction } from '.'

export interface CreditManagersState {
  updated: number
  error?: Error
  data: Record<string, CreditManagerData> | null
  adapterManagers: Record<string, AdapterManager>
}

const initialState: CreditManagersState = {
  updated: 0,
  data: null,
  adapterManagers: {}
}

export function creditManagerReducer(
  state: CreditManagersState = initialState,
  action: CreditManagerAction
): CreditManagersState {
  switch (action.type) {
    case 'CREDIT_MANAGERS_SUCCESS':
      return {
        ...state,
        data: action.payload.creditManagers,
        adapterManagers: action.payload.adapterManagers,
        error: undefined
      }

    case 'CREDIT_MANAGERS_ERROR':
      return {
        ...state,
        error: action.payload
      }

    default:
      return state
  }
}
