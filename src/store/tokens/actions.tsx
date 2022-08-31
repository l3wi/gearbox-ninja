import { ERC20__factory } from '@gearbox-protocol/sdk/lib/types'
import {
  callRepeater,
  MAX_INT,
  TokenData,
  TxApprove,
  MCall,
  ERC20,
  multicall,
  AwaitedRes
} from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'

import { getError } from '../operations'
import { RootState } from '../index'
import actions from '../actions'
import { getAllowanceId, ThunkTokenAction, TokenAction } from './index'

type ERC20Interface = ERC20['interface']

const getTokenContract = async (getState: () => RootState, address: string) => {
  const { signer, account } = getState().web3
  if (!signer || !account) {
    throw new Error('Cant get signer or account')
  }

  return ERC20__factory.connect(address, signer)
}

export const approveToken =
  (
    tokenAddress: string,
    to: string,
    account: string,
    opHash?: string
  ): ThunkTokenAction =>
  async (dispatch, getState) => {
    const id = getAllowanceId(tokenAddress, to)

    try {
      dispatch(actions.game.AddNotification('Waiting for user'))

      dispatch(actions.operations.updateStatus(opHash, 'STATUS.WAITING'))
      const token = await getTokenContract(getState, tokenAddress)
      const receipt = await token.approve(to, MAX_INT)

      dispatch(actions.game.AddNotification('Approval Pending', 0))
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.LOADING'))
      dispatch({
        type: 'TOKEN_VIRTUAL_ALLOWANCE',
        payload: { id, allowance: MAX_INT }
      })

      await receipt.wait(1)

      dispatch(actions.operations.updateStatus(opHash, 'STATUS.SUCCESS'))
      dispatch(actions.game.AddNotification('Approval successful'))
      const evmTx = new TxApprove({
        txHash: receipt.hash,
        token: tokenAddress,
        timestamp: 0
      })

      dispatch(
        actions.web3.addPendingTransaction(evmTx, () => {
          dispatch(getTokenAllowance(tokenAddress, to, account))
        })
      )
    } catch (e: any) {
      dispatch(actions.game.AddNotification('Approval failed'))
      dispatch({ type: 'TOKEN_DELETE_VIRTUAL_ALLOWANCE', payload: id })
      dispatch(
        actions.operations.updateStatus(opHash, 'STATUS.FAILURE', getError(e))
      )
      console.error(
        'store/tokens/actions',
        'Cant approveToken',
        tokenAddress,
        to,
        e
      )
    }
  }

export const getTokenBalance =
  (address: string, opHash?: string): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      const { signer, account } = getState().web3
      if (!signer || !account) {
        throw new Error('Cant get signer or account')
      }

      const token = await getTokenContract(getState, address)
      const balance = BigNumber.from(
        await callRepeater(() => token.connect(signer).balanceOf(account))
      )

      dispatch({
        type: 'TOKEN_BALANCE_SUCCESS',
        payload: { id: address.toLowerCase(), balance }
      })
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(
        actions.operations.updateStatus(opHash, 'STATUS.FAILURE', getError(e))
      )
      console.error('store/tokens/actions', 'Cant getTokenBalance', address, e)
    }
  }

export const updateBatchBalances = (
  updatedBalances: Record<string, BigNumber>
): TokenAction => ({
  type: 'TOKEN_BATCH_BALANCE_SUCCESS',
  payload: updatedBalances
})

export const getTokenAllowance =
  (tokenAddress: string, to: string, account: string): ThunkTokenAction =>
  async (dispatch, getState) => {
    const id = getAllowanceId(tokenAddress, to)
    try {
      dispatch({
        type: 'TOKEN_ALLOWANCE_SUCCESS',
        payload: { id, allowance: BigNumber.from(0) }
      })

      const { signer } = getState().web3
      if (!signer) {
        throw new Error('Cant get signer')
      }

      const token = await getTokenContract(getState, tokenAddress)
      const allowance = BigNumber.from(
        await callRepeater(() => token.allowance(account, to))
      )

      dispatch({
        type: 'TOKEN_ALLOWANCE_SUCCESS',
        payload: { id, allowance }
      })
      dispatch({ type: 'TOKEN_DELETE_VIRTUAL_ALLOWANCE', payload: id })
    } catch (e: any) {
      dispatch({ type: 'TOKEN_DELETE_VIRTUAL_ALLOWANCE', payload: id })
      console.error(
        'store/tokens/actions',
        'Cant getTokenAllowance',
        tokenAddress,
        to,
        e
      )
    }
  }

export const getTokenAllowances =
  (
    tokens: Record<string, TokenData>,
    to: string,
    account: string
  ): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      const { signer } = getState().web3
      if (!signer) {
        throw new Error('Cant get signer')
      }

      const tokenAddresses = Object.keys(tokens)

      const calls: Array<MCall<ERC20Interface>> = tokenAddresses.map(
        (address) => ({
          address,
          interface: ERC20__factory.createInterface(),
          method: 'allowance(address,address)',
          params: [account, to]
        })
      )

      const allowanceBNs = await callRepeater(() =>
        multicall<Array<AwaitedRes<ERC20['allowance']>>>(
          calls,
          signer.provider!
        )
      )

      const allowances = tokenAddresses.reduce<Record<string, BigNumber>>(
        (acc, tokenAddress, index) => {
          const bn = allowanceBNs[index]
          const id = getAllowanceId(tokenAddress, to)
          acc[id] = bn || BigNumber.from(0)
          return acc
        },
        {}
      )

      dispatch({
        type: 'TOKEN_ALLOWANCE_BATCH_SUCCESS',
        payload: allowances
      })
    } catch (e: any) {
      console.error(
        'store/tokens/actions',
        'Cant getTokenAllowances',
        account,
        to,
        e
      )
    }
  }

export const clearBalancesAllowances = (): TokenAction => ({
  type: 'TOKEN_BALANCES_ALLOWANCES_CLEAR'
})
