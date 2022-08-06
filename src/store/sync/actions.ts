import {
  callRepeater,
  CreditManagerData,
  ERC20__factory,
  EventAddCollateral,
  EventAddLiquidity,
  EventCloseCreditAccount,
  EventIncreaseBorrowAmount,
  EventLiquidateCreditAccount,
  EventOpenCreditAccount,
  EventRemoveLiquidity,
  EventRepayCreditAccount,
  ICreditManager,
  IPoolService,
  PoolData,
  multicall,
  MCall,
  Multicall2__factory,
  EventOrTx,
  AwaitedRes,
  Multicall2,
  ERC20
} from '@gearbox-protocol/sdk'
import { BigNumber, ethers } from 'ethers'

import { updateBatchBalances } from '../tokens/actions'
import { getPrices } from '../prices/actions'
import { SyncThunkAction } from './index'
import { MULTICALL_ADDRESS } from '../../config'

type Multicall2Interface = Multicall2['interface']
type ERC20Interface = ERC20['interface']

export const updateLastBlock =
  (provider: ethers.providers.JsonRpcProvider): SyncThunkAction =>
  async (dispatch, getState) => {
    try {
      const { pathFinder, account } = getState().web3
      if (!pathFinder) throw new Error('pathfinder is undefined')

      const priceTokens = getState().price.tokensList
      const allTokens = Object.keys(getState().tokens.details)

      const calls: [
        MCall<Multicall2Interface>,
        ...Array<MCall<Multicall2Interface>>,
        ...Array<MCall<ERC20Interface>>
      ] = [
        {
          address: MULTICALL_ADDRESS,
          interface: Multicall2__factory.createInterface(),
          method: 'getBlockNumber()'
        }
      ]

      if (account) {
        calls.push({
          address: MULTICALL_ADDRESS,
          interface: Multicall2__factory.createInterface(),
          method: 'getEthBalance(address)',
          params: [account]
        })

        allTokens.forEach((token) => {
          calls.push({
            address: token,
            interface: ERC20__factory.createInterface(),
            method: 'balanceOf(address)',
            params: [account]
          })
        })
      }

      const [block, ethBalance, ...balanceResult] = await callRepeater(() =>
        multicall<
          [
            AwaitedRes<Multicall2['getBlockNumber']>,
            AwaitedRes<Multicall2['getEthBalance']>,
            ...Array<AwaitedRes<ERC20['balanceOf']>>
          ]
        >(calls, provider)
      )

      dispatch(getPrices(provider, priceTokens))

      if (account) {
        dispatch({ type: 'WEB3_BALANCE_SUCCESS', payload: ethBalance })

        const balances = balanceResult.reduce<Record<string, BigNumber>>(
          (acc, b, num) => {
            acc[allTokens[num].toLowerCase()] = b
            return acc
          },
          {}
        )

        dispatch(updateBatchBalances(balances))
      }

      dispatch({
        type: 'SYNC_LASTBLOCK',
        payload: block.toNumber()
      })
    } catch (e: any) {
      console.error('store/sync/actions', 'Cant updateLastBlock', e)
    }
  }

export const updatePoolEvents =
  (
    account: string,
    pool: PoolData,
    contract: IPoolService,
    atBlock?: number
  ): SyncThunkAction =>
  async (dispatch, getState) => {
    const eventMap: Record<string, EventOrTx> = {}

    const from = getState().sync.lastPoolSync[account] || 0
    const to = atBlock || getState().sync.lastBlock

    try {
      const add = await contract.queryFilter(
        contract.filters.AddLiquidity(null, account),
        from
      )
      add.forEach((e) => {
        eventMap[e.transactionHash] = new EventAddLiquidity({
          block: e.blockNumber,
          txHash: e.transactionHash,
          amount: e.args.amount.toString(),
          underlyingToken: pool.underlyingToken,
          pool: pool.address,
          timestamp: 0
        })
      })

      const remove = await contract.queryFilter(
        contract.filters.RemoveLiquidity(account),
        from
      )
      remove.forEach((e) => {
        eventMap[e.transactionHash] = new EventRemoveLiquidity({
          block: e.blockNumber,
          txHash: e.transactionHash,
          amount: e.args.amount.toString(),
          underlyingToken: pool.underlyingToken,
          dieselToken: pool.dieselToken,
          pool: pool.address,
          timestamp: 0
        })
      })

      dispatch({
        type: 'EVENT_UPDATE',
        payload: { account, events: eventMap, poolSync: to }
      })
    } catch (e: any) {
      console.error('store/sync/actions', 'Cant updatePoolEvents', e)
    }
  }

export const updateCreditManagerEvents =
  (
    account: string,
    creditManager: CreditManagerData,
    contract: ICreditManager,
    atBlock?: number
  ): SyncThunkAction =>
  async (dispatch, getState) => {
    const eventMap: Record<string, EventOrTx> = {}

    const from = getState().sync.lastCreditManagerSync[account] || 0
    const to = atBlock || getState().sync.lastBlock

    try {
      const open = await contract.queryFilter(
        contract.filters.OpenCreditAccount(null, account),
        from
      )
      open.forEach((e) => {
        eventMap[e.transactionHash] = new EventOpenCreditAccount({
          block: e.blockNumber,
          txHash: e.transactionHash,
          amount: e.args.amount.toString(),
          timestamp: 0,
          underlyingToken: creditManager.underlyingToken,
          creditManager: creditManager.address,
          leverage:
            e.args.borrowAmount
              .add(e.args.amount)
              .mul(100)
              .div(e.args.amount)
              .toNumber() / 100
        })
      })

      const close = await contract.queryFilter(
        contract.filters.CloseCreditAccount(account),
        from
      )
      close.forEach((e) => {
        eventMap[e.transactionHash] = new EventCloseCreditAccount({
          block: e.blockNumber,
          txHash: e.transactionHash,
          amount: e.args.remainingFunds.toString(),
          timestamp: 0,
          underlyingToken: creditManager.underlyingToken,
          creditManager: creditManager.address
        })
      })

      const repay = await contract.queryFilter(
        contract.filters.RepayCreditAccount(account),
        from
      )
      repay.forEach((e) => {
        eventMap[e.transactionHash] = new EventRepayCreditAccount({
          block: e.blockNumber,
          txHash: e.transactionHash,
          timestamp: 0,
          underlyingToken: creditManager.underlyingToken,
          creditManager: creditManager.address
        })
      })

      const liquidate = await contract.queryFilter(
        contract.filters.LiquidateCreditAccount(account),
        from
      )
      liquidate.forEach((e) => {
        eventMap[e.transactionHash] = new EventLiquidateCreditAccount({
          block: e.blockNumber,
          txHash: e.transactionHash,
          amount: e.args.remainingFunds.toString(),
          timestamp: 0,
          underlyingToken: creditManager.underlyingToken,
          creditManager: creditManager.address
        })
      })

      const addCollateral = await contract.queryFilter(
        contract.filters.AddCollateral(account),
        from
      )

      addCollateral.forEach((e) => {
        eventMap[e.transactionHash] = new EventAddCollateral({
          block: e.blockNumber,
          txHash: e.transactionHash,
          timestamp: 0,
          amount: e.args.value.toString(),
          addedToken: e.args.token,
          creditManager: creditManager.address
        })
      })

      const borrowMore = await contract.queryFilter(
        contract.filters.IncreaseBorrowedAmount(account),
        from
      )
      borrowMore.forEach((e) => {
        eventMap[e.transactionHash] = new EventIncreaseBorrowAmount({
          block: e.blockNumber,
          txHash: e.transactionHash,
          timestamp: 0,
          amount: e.args.amount.toString(),
          underlyingToken: creditManager.underlyingToken,
          creditManager: creditManager.address
        })
      })

      dispatch({
        type: 'EVENT_UPDATE',
        payload: { account, events: eventMap, creditManagerSync: to }
      })
    } catch (e: any) {
      console.error('store/sync/actions', 'Cant updateCreditManagerEvents', e)
    }
  }
