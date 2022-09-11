import { CreditManagerData } from '@gearbox-protocol/sdk'
import { OperationActions } from '../operations'
import { ThunkAction } from 'redux-thunk'

import { AdapterManager } from '../../config/adapterManager'
import { CreditAccountsAction } from '../creditAccounts'
import { RootState } from '../index'

export const endpoint = `/api/accounts/`

export type CreditManagerAction =
  | {
      type: 'CREDIT_MANAGERS_SUCCESS'
      payload: {
        creditManagers: Record<string, CreditManagerData>
        adapterManagers: Record<string, AdapterManager>
      }
    }
  | {
      type: 'CREDIT_MANAGERS_ERROR'
      payload: Error
    }

export type CreditManagerThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  CreditManagerAction | CreditAccountsAction | OperationActions
>

export const creditManagersSelector = (state: RootState) =>
  state.creditManagers.data

export const adapterManagerSelector =
  (address?: string) => (state: RootState) =>
    address
      ? state.creditManagers.adapterManagers[address.toLowerCase()]
      : undefined

export const creditManagerErrorSelector = (state: RootState) =>
  state.creditManagers.error

export function getCreditManagerOrThrow(
  getState: () => RootState,
  address: string
): CreditManagerData {
  const addressLc = address.toLowerCase()
  const {
    creditManagers: { data }
  } = getState()
  const creditManager = data?.[addressLc]
  if (!creditManager || creditManager instanceof Error) {
    throw new Error(`Credit manager with with ${addressLc} is not loaded`)
  }

  return creditManager
}
