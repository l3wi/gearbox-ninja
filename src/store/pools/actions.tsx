import { BigNumber } from 'ethers'
import {
  callRepeater,
  NetworkError,
  PoolData,
  PoolDataPayload,
  TxAddLiquidity,
  TxRemoveLiquidity
} from '@gearbox-protocol/sdk'

import { getSignerOrThrow, getWETHGatewayOrThrow } from '../web3'
import { ThunkTokenAction } from '../tokens'
import { getError } from '../operations'
import actions from '../actions'

import { PoolThunkAction } from '.'

export const getList = (): PoolThunkAction => async (dispatch, getState) => {
  try {
    const { dataCompressor, account } = getState().web3
    if (!dataCompressor) {
      throw new Error('No account selected')
    }

    const poolsPayload: Array<PoolDataPayload> = await callRepeater(() =>
      dataCompressor.getPoolsList()
    )

    const result: Record<string, PoolData> = {}

    for (let p of poolsPayload) {
      result[p.addr.toLowerCase()] = new PoolData(p)
      if (account)
        dispatch(
          actions.tokens.getTokenAllowance(p.underlying, p.addr, account)
        )
    }

    dispatch({
      type: 'POOL_LIST_SUCCESS',
      payload: result
    })
  } catch (e: any) {
    dispatch({
      type: 'POOL_LIST_FAILURE',
      payload: new NetworkError()
    })
    console.error('store/pools/actions', 'Pools: cant getList', e)
  }
}

export const addLiquidity =
  (pool: PoolData, amount: BigNumber, opHash?: string): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.WAITING'))
      const signer = getSignerOrThrow(getState)
      const signerAddress = await signer.getAddress()

      dispatch(actions.game.AddNotification('Waiting for user'))
      if (pool.isWETH) {
        const wethGateway = getWETHGatewayOrThrow(getState)

        const signerAddress = await signer.getAddress()
        const receipt = await wethGateway
          .connect(signer)
          .addLiquidityETH(pool.address, signerAddress, 0, {
            value: amount
          })
        dispatch(actions.operations.updateStatus(opHash, 'STATUS.LOADING'))
        dispatch(actions.game.AddNotification('Deposit Pending', 0))

        await receipt.wait()
      } else {
        const tx = await pool
          .getContractETH(signer)
          .populateTransaction.addLiquidity(amount, signerAddress, 0)

        const receipt = await signer.sendTransaction(tx)

        dispatch(actions.game.AddNotification('Deposit Pending', 0))
        dispatch(actions.operations.updateStatus(opHash, 'STATUS.LOADING'))

        // Add transaction to wait list
        dispatch(
          actions.web3.addPendingTransaction(
            new TxAddLiquidity({
              txHash: receipt.hash,
              amount,
              underlyingToken: pool.underlyingToken,
              pool: pool.address,
              timestamp: 0
            }),
            () => dispatch(getList())
          )
        )
      }
      dispatch(actions.game.AddNotification('Deposit successful!'))
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(
        actions.operations.updateStatus(opHash, 'STATUS.FAILURE', getError(e))
      )
      dispatch(actions.game.AddNotification('Deposit failed!'))

      console.error(
        'store/pools/actions',
        'Cant addLiquidity',
        pool.address,
        amount.toString(),
        e
      )
    }
  }

export const removeLiquidity =
  (pool: PoolData, amount: BigNumber, opHash?: string): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.WAITING'))
      const signer = getSignerOrThrow(getState)
      const signerAddress = await signer.getAddress()

      if (pool.isWETH) {
        const wethGateway = getWETHGatewayOrThrow(getState)

        const signerAddress = await signer.getAddress()

        const receipt = await wethGateway
          .connect(signer)
          .removeLiquidityETH(pool.address, amount, signerAddress)
        dispatch(actions.operations.updateStatus(opHash, 'STATUS.LOADING'))
        await receipt.wait()
      } else {
        const receipt = await pool
          .getContractETH(signer)
          .connect(signer)
          .removeLiquidity(amount, signerAddress)
        dispatch(actions.operations.updateStatus(opHash, 'STATUS.LOADING'))

        // Add transaction to wait list
        dispatch(
          actions.web3.addPendingTransaction(
            new TxRemoveLiquidity({
              txHash: receipt.hash,
              amount,
              dieselToken: pool.dieselToken,
              pool: pool.address,
              timestamp: 0
            }),
            () => dispatch(getList())
          )
        )
      }
      dispatch(actions.operations.updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(
        actions.operations.updateStatus(opHash, 'STATUS.FAILURE', getError(e))
      )
      console.error(
        'store/pools/actions',
        'Cant removeLiquidity',
        pool.address,
        amount.toString(),
        e
      )
    }
  }
