/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { CreditAccountData, Rewards } from '@gearbox-protocol/sdk'

import type { CreditAccountsAction } from '.'

export interface CreditAccountsState {
  list: Record<string, CreditAccountData> | null
  listError: Error | undefined
  details: Record<string, CreditAccountData | Error>
  openInProgress: Record<string, boolean>
  deleteInProgress: Record<string, boolean>
  rewards: Record<string, Array<Rewards> | null | undefined>
}

const initialState: CreditAccountsState = {
  list: null,
  listError: undefined,
  details: {},
  openInProgress: {},
  deleteInProgress: {},
  rewards: {}
}

export function creditAccountsReducer(
  state: CreditAccountsState = initialState,
  action: CreditAccountsAction
): CreditAccountsState {
  switch (action.type) {
    case 'CREDIT_ACCOUNTS_LIST_SUCCESS':
      return {
        ...state,
        list: action.payload,
        listError: undefined
      }
    case 'CREDIT_ACCOUNTS_LIST_FAILURE':
      return {
        ...state,
        list: {},
        listError: action.payload
      }
    case 'CREDIT_ACCOUNT_DETAILS_SUCCESS':
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.address]: action.payload.ca
        }
      }

    case 'CREDIT_ACCOUNT_DETAILS_FAILURE':
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.address]: action.payload.error
        }
      }

    case 'CREDIT_ACCOUNT_DELETE_ACCOUNT': {
      const list = { ...state.list }
      const details = { ...state.details }
      const deleteInProgress = { ...state.deleteInProgress }

      delete list[action.payload]
      delete details[action.payload]
      delete deleteInProgress[action.payload]

      return {
        ...state,
        list,
        details,
        deleteInProgress
      }
    }

    case 'CREDIT_ACCOUNT_DELETE_IN_PROGRESS_ACCOUNT':
      return {
        ...state,
        deleteInProgress: {
          ...state.deleteInProgress,
          [action.payload]: true
        }
      }

    case 'CREDIT_ACCOUNT_OPEN_IN_PROGRESS_ACCOUNT':
      return {
        ...state,
        openInProgress: {
          ...state.openInProgress,
          [action.payload]: true
        }
      }

    case 'CREDIT_ACCOUNT_REMOVE_OPEN_IN_PROGRESS_ACCOUNT': {
      const openInProgress = { ...state.openInProgress }

      delete openInProgress[action.payload]
      return {
        ...state,
        openInProgress
      }
    }

    case 'CREDIT_ACCOUNT_CLEAR':
      return {
        ...state,
        details: {},
        list: {}
      }

    case 'SET_REWARD':
      return {
        ...state,
        rewards: { [action.payload.creditAccount]: action.payload.reward }
      }

    default:
      return state
  }
}
