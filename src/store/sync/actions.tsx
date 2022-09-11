import {
  AwaitedRes,
  callRepeater,
  CreditManagerData,
  EventAddCollateral,
  EventAddLiquidity,
  EventCloseCreditAccount,
  EventIncreaseBorrowAmount,
  EventLiquidateCreditAccount,
  EventOpenCreditAccount,
  EventOrTx,
  EventRemoveLiquidity,
  EventRepayCreditAccount,
  ICreditManager,
  IERC20,
  IERC20__factory,
  IPoolService,
  MCall,
  multicall,
  Multicall2,
  Multicall2__factory,
  PoolData
} from '@gearbox-protocol/sdk'
import { BigNumber, ethers } from 'ethers'

import { MULTICALL_ADDRESS } from '../../config'
import { tokenDataList } from '../../config/tokens'
import { captureException } from '../../utils/errors'
import { getPrices } from '../prices/actions'
import { updateBatchBalances } from '../tokens/actions'
import { SyncThunkAction } from './index'

type Multicall2Interface = Multicall2['interface']
type ERC20Interface = IERC20['interface']

export const updateLastBlock =
  (provider: ethers.providers.JsonRpcProvider): SyncThunkAction =>
  async (dispatch, getState) => {
    try {
      const {
        web3: { pathFinder, account },
        price: { tokensList: priceTokens },
        tokens: { details: tokens }
      } = getState()
      if (!pathFinder) throw new Error('pathfinder is undefined')

      const allTokens = Object.keys(tokens)

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
            interface: IERC20__factory.createInterface(),
            method: 'balanceOf(address)',
            params: [account]
          })
        })

        const resp = await Promise.allSettled(
          allTokens.map((token) =>
            IERC20__factory.connect(token, provider).balanceOf(
              account as string
            )
          )
        )

        console.debug(
          'BALANCES NOT FOUND',
          resp.reduce((acc, r, i) => {
            if (r.status === 'rejected') {
              const tAddress = allTokens[i]

              acc[tAddress] = tokenDataList?.[tAddress].symbol
            }
            return acc
          }, {} as Record<string, any>)
        )
      }

      const [block, ethBalance, ...balanceResult] = await callRepeater(() =>
        multicall<
          [
            AwaitedRes<Multicall2['getBlockNumber']>,
            AwaitedRes<Multicall2['getEthBalance']>,
            ...Array<AwaitedRes<IERC20['balanceOf']>>
          ]
        >(calls, provider)
      )

      dispatch(getPrices(provider, priceTokens))

      if (account) {
        dispatch({ type: 'WEB3_BALANCE_SUCCESS', payload: ethBalance })

        const balances = balanceResult.reduce<Record<string, BigNumber>>(
          (acc, b, num) => {
            acc[allTokens[num]] = b
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
      captureException('store/sync/actions', 'Cant updateLastBlock', e)
    }
  }

interface UpdatePoolEventsProps {
  account: string
  pool: PoolData
  contract: IPoolService
  atBlock?: number
}

export const updatePoolEvents =
  ({
    account,
    pool,
    contract,
    atBlock
  }: UpdatePoolEventsProps): SyncThunkAction =>
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
      captureException('store/sync/actions', 'Cant updatePoolEvents', e)
    }
  }

interface UpdateCreditManagerEventsProps {
  account: string
  creditManager: CreditManagerData
  contract: ICreditManager
  atBlock?: number
}

export const updateCreditManagerEvents =
  ({
    account,
    creditManager,
    contract,
    atBlock
  }: UpdateCreditManagerEventsProps): SyncThunkAction =>
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
      captureException(
        'store/sync/actions',
        'Cant updateCreditManagerEvents',
        e
      )
    }
  }
