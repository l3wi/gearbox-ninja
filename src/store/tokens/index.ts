import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'
import { OperationActions } from '../operations'
import { TokenAllowance, TokenBalance, TokenData } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'

export type TokenAction =
  | {
      type: 'TOKEN_BATCH_DETAILS_SUCCESS'
      payload: Record<string, TokenData>
    }
  | {
      type: 'TOKEN_BALANCE_SUCCESS'
      payload: TokenBalance
    }
  | {
      type: 'TOKEN_BATCH_BALANCE_SUCCESS'
      payload: Record<string, BigNumber>
    }
  | {
      type: 'TOKEN_BALANCES_ALLOWANCES_CLEAR'
    }
  | {
      type: 'TOKEN_ALLOWANCE_SUCCESS'
      payload: TokenAllowance
    }
  | {
      type: 'TOKEN_ALLOWANCE_BATCH_SUCCESS'
      payload: Record<string, BigNumber>
    }
  | {
      type: 'TOKEN_VIRTUAL_ALLOWANCE'
      payload: TokenAllowance
    }
  | {
      type: 'TOKEN_DELETE_VIRTUAL_ALLOWANCE'
      payload: string
    }

export type ThunkTokenAction = ThunkAction<
  void,
  RootState,
  unknown,
  TokenAction | OperationActions
>

export const tokenDataMapSelector = (state: RootState) => state.token.details

export const tokenBalancesSelector = (state: RootState) => state.token.balances
export const tokenBalanceSelector = (address: string) => (state: RootState) =>
  state.token.balances[address]

export const allowancesSelector = () => (state: RootState) =>
  state.token.allowances
export const tokenAllowanceSelector =
  (address: string, to: string) => (state: RootState) =>
    state.token.allowances[getAllowanceId(address, to)]

export const virtualTokenAllowancesSelector = () => (state: RootState) =>
  state.token.virtualAllowances
export const virtualTokenAllowanceSelector =
  (address: string, to: string) => (state: RootState) =>
    state.token.virtualAllowances[getAllowanceId(address, to)]

export const getAllowanceId = (tokenAddress: string, to: string) =>
  `${tokenAddress}@${to}`
