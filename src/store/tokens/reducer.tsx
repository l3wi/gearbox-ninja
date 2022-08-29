import { TokenData } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'

import { tokenDataList } from '../../config/tokens'
import { TokenAction } from './index'

export interface TokenState {
  details: Record<string, TokenData>
  balances: Record<string, BigNumber>
  allowances: Record<string, BigNumber>
  virtualAllowances: Record<string, BigNumber>
}

const initialState: TokenState = {
  details: tokenDataList,
  balances: {},
  allowances: {},
  virtualAllowances: {}
}

export function tokenReducer(
  state: TokenState = initialState,
  action: TokenAction
): TokenState {
  switch (action.type) {
    case 'TOKEN_BATCH_DETAILS_SUCCESS':
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload
        }
      }

    case 'TOKEN_BALANCE_SUCCESS':
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.id]: action.payload.balance
        }
      }

    case 'TOKEN_BATCH_BALANCE_SUCCESS':
      return {
        ...state,
        balances: {
          ...state.balances,
          ...action.payload
        }
      }

    case 'TOKEN_ALLOWANCE_SUCCESS':
      return {
        ...state,
        allowances: {
          ...state.allowances,
          [action.payload.id]: action.payload.allowance
        }
      }

    case 'TOKEN_ALLOWANCE_BATCH_SUCCESS':
      return {
        ...state,
        allowances: {
          ...state.allowances,
          ...action.payload
        }
      }

    case 'TOKEN_VIRTUAL_ALLOWANCE':
      return {
        ...state,
        virtualAllowances: {
          ...state.virtualAllowances,
          [action.payload.id]: action.payload.allowance
        }
      }

    case 'TOKEN_DELETE_VIRTUAL_ALLOWANCE':
      const virtualAllowances = { ...state.virtualAllowances }
      delete virtualAllowances[action.payload]
      return {
        ...state,
        virtualAllowances
      }

    case 'TOKEN_BALANCES_ALLOWANCES_CLEAR':
      return {
        ...state,
        balances: {},
        allowances: {},
        virtualAllowances: {}
      }

    default:
      return state
  }
}
