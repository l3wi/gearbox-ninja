import {
  callRepeater,
  CreditAccountData,
  CreditAccountDataPayload,
  NetworkError,
  UserHasNotAccountError
} from '@gearbox-protocol/sdk'

import { captureException } from '../../utils/errors'
import { CreditAccountsAction, CreditAccountsThunkAction } from './index'

export const getList =
  (): CreditAccountsThunkAction => async (dispatch, getState) => {
    try {
      const { dataCompressor, account } = getState().web3

      if (!dataCompressor || !account)
        throw new Error('Data compressor or account is undefined')

      const creditAccountsJson: Array<CreditAccountDataPayload> =
        await callRepeater(() => dataCompressor.getCreditAccountList(account))

      const payload: Record<string, CreditAccountData> = {}

      creditAccountsJson.forEach((ca) => {
        payload[ca.creditManager.toLowerCase()] = new CreditAccountData(ca)
      })

      dispatch({
        type: 'CREDIT_ACCOUNTS_LIST_SUCCESS',
        payload
      })
    } catch (e: any) {
      dispatch({
        type: 'CREDIT_ACCOUNTS_LIST_FAILURE',
        payload: new NetworkError()
      })
      captureException('store/creditAccounts/actions', 'CA: cant getList ca', e)
    }
  }

export const getByCreditManager =
  (creditManager: string, account: string): CreditAccountsThunkAction =>
  async (dispatch, getState) => {
    const creditManagerAddressLC = creditManager.toLowerCase()
    const { dataCompressor } = getState().web3

    try {
      if (!dataCompressor) throw new Error('dataCompressor is undefined')

      const hasAccount = await callRepeater(() =>
        dataCompressor.hasOpenedCreditAccount(creditManagerAddressLC, account)
      )
      if (!hasAccount) {
        dispatch({
          type: 'CREDIT_ACCOUNT_DETAILS_FAILURE',
          payload: {
            address: creditManagerAddressLC,
            error: new UserHasNotAccountError()
          }
        })
        return
      }
      const creditAccountPayload: CreditAccountDataPayload = await callRepeater(
        () =>
          dataCompressor.getCreditAccountData(creditManagerAddressLC, account)
      )

      const ca = new CreditAccountData(creditAccountPayload)

      dispatch({
        type: 'CREDIT_ACCOUNT_DETAILS_SUCCESS',
        payload: { address: ca.id.toLowerCase(), ca }
      })
    } catch (eo) {
      try {
        if (!dataCompressor) throw new Error('dataCompressor is undefined')
        throw new Error('Cant get creditAccount, however it exists')
      } catch (e: any) {
        dispatch({
          type: 'CREDIT_ACCOUNT_DETAILS_FAILURE',
          payload: {
            address: creditManagerAddressLC,
            error: new NetworkError()
          }
        })
        captureException(
          'store/creditAccounts/actions',
          'Cant getByCreditManager',
          e
        )
      }
    }
  }

export const openInProgressByCreditManager = (
  creditManager: string
): CreditAccountsAction => ({
  type: 'CREDIT_ACCOUNT_OPEN_IN_PROGRESS_ACCOUNT',
  payload: creditManager.toLowerCase()
})

export const removeOpenInProgressByCreditManager = (
  creditManager: string
): CreditAccountsAction => ({
  type: 'CREDIT_ACCOUNT_REMOVE_OPEN_IN_PROGRESS_ACCOUNT',
  payload: creditManager.toLowerCase()
})

export const deleteInProgressByCreditManager = (
  creditManager: string
): CreditAccountsAction => ({
  type: 'CREDIT_ACCOUNT_DELETE_IN_PROGRESS_ACCOUNT',
  payload: creditManager.toLowerCase()
})

export const deleteByCreditManager = (
  creditManager: string
): CreditAccountsAction => ({
  type: 'CREDIT_ACCOUNT_DELETE_ACCOUNT',
  payload: creditManager.toLowerCase()
})

export const clearCreditAccounts = (): CreditAccountsAction => ({
  type: 'CREDIT_ACCOUNT_CLEAR'
})
