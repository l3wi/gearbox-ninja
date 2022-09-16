import { CreditAccountData } from '@gearbox-protocol/sdk'
import { OperationActions } from '../operations'
import { ThunkAction } from 'redux-thunk'

import { Exists } from '../../config/exists'
import { RootState } from '../index'

export type CreditAccountsAction =
  | {
      type: 'CREDIT_ACCOUNTS_LIST_SUCCESS'
      payload: Record<string, CreditAccountData>
    }
  | {
      type: 'CREDIT_ACCOUNTS_LIST_FAILURE'
      payload: Error
    }
  | {
      type: 'CREDIT_ACCOUNT_DETAILS_SUCCESS'
      payload: { address: string; ca: CreditAccountData }
    }
  | {
      type: 'CREDIT_ACCOUNT_DETAILS_FAILURE'
      payload: { address: string; error: Error }
    }
  | {
      type: 'CREDIT_ACCOUNT_EXISTENCE_UPDATE'
      payload: { id: string; exists: Exists }
    }
  | {
      type: 'CREDIT_ACCOUNT_DELETE_IN_PROGRESS_ACCOUNT'
      payload: string
    }
  | {
      type: 'CREDIT_ACCOUNT_OPEN_IN_PROGRESS_ACCOUNT'
      payload: string
    }
  | {
      type: 'CREDIT_ACCOUNT_REMOVE_OPEN_IN_PROGRESS_ACCOUNT'
      payload: string
    }
  | {
      type: 'CREDIT_ACCOUNT_DELETE_ACCOUNT'
      payload: string
    }
  | {
      type: 'CREDIT_ACCOUNT_CLEAR'
    }

export type CreditAccountsThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  CreditAccountsAction | OperationActions
>

export const creditAccountsListSelector = (state: RootState) =>
  state.creditAccounts.list

export const creditAccountsListErrorSelector = (state: RootState) =>
  state.creditAccounts.listError

export const creditAccountDetailsSelector =
  (address: string) => (state: RootState) =>
    state.creditAccounts.details[address.toLowerCase()]

export const creditAccountDeleteInProgress = (state: RootState) =>
  state.creditAccounts.deleteInProgress

export const creditAccountOpenInProgress =
  (address: string) => (state: RootState) =>
    state.creditAccounts.openInProgress[address.toLowerCase()]
