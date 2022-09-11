import { BigNumber, ethers } from 'ethers'
import {
  Asset,
  CreditManagerData,
  getNetworkType,
  ICreditFacade__factory,
  LPTokenDataI,
  LPTokens,
  LpTokensAPY,
  PRICE_DECIMALS,
  Strategy,
  TxOpenMultitokenAccount
} from '@gearbox-protocol/sdk'
import { updateStatus } from '../operations'

import { CHAIN_ID } from '../../config'
import { TradePath } from '../../config/closeTradePath'
import { strategiesPayload } from '../../config/strategy'
import { connectorTokenAddresses } from '../../config/tokens/tokenLists'
import { captureException } from '../../utils/errors'

import { getError } from '../operations'
import { getSignerOrThrow } from '../web3'
import { addPendingTransaction } from '../web3/transactions'
import { getTokenBalances } from '../tokens/actions'

import {
  getByCreditManager,
  getList as caGetList,
  openInProgressByCreditManager,
  removeOpenInProgressByCreditManager
} from '../creditAccounts/actions'

import {
  getAPYValue,
  getConvexAPY,
  getCurveAPY,
  getLidoAPY,
  getYearnAPY
} from './apy'
import { StrategyThunkAction } from './index'

const memoProvidePrice =
  (prices: Record<string, BigNumber>) =>
  (t = '') => {
    const price = prices[t?.toLowerCase()]
    return price || PRICE_DECIMALS
  }

export const getApy =
  (
    provider: ethers.providers.JsonRpcProvider,
    prices: Record<string, BigNumber>,
    lpTokensDataList: Record<string, LPTokenDataI>
  ): StrategyThunkAction =>
  async (dispatch) => {
    try {
      const networkType = getNetworkType(CHAIN_ID)
      const providePrice = memoProvidePrice(prices)

      const [crv, originalCrv] = await getCurveAPY()

      const [cvx, ldo, yearn] = await Promise.all([
        getConvexAPY({
          provider,
          networkType,
          getTokenPrice: providePrice,
          curveAPY: originalCrv
        }),
        getLidoAPY(provider, networkType),
        getYearnAPY()
      ])

      const lpTokenAPY = Object.values(lpTokensDataList).reduce(
        (acc, tokenDetails) => {
          const { symbol } = tokenDetails

          acc[symbol] = getAPYValue(tokenDetails, { crv, cvx, yearn })
          return acc
        },
        {} as Record<LPTokens, number>
      )

      dispatch({
        type: 'SET_APY_BULK',
        payload: { ...lpTokenAPY, LDO: ldo }
      })
    } catch (e: any) {
      console.error('store/strategy/actions', 'Cant getApy', e)
    }
  }

export const getStrategies =
  (apys: LpTokensAPY): StrategyThunkAction =>
  async (dispatch) => {
    try {
      const strategies = strategiesPayload.reduce<Record<string, Strategy>>(
        (acc, payload) => {
          acc[payload.lpToken] = new Strategy({
            ...payload,
            apy: apys[payload.apyTokenSymbol] || 0
          })
          return acc
        },
        {}
      )

      dispatch({
        type: 'SET_STRATEGY_BULK',
        payload: strategies
      })
    } catch (e: any) {
      console.error('store/pice/actions', 'Cant getStrategies', e)
    }
  }

interface GetOpenStrategyPathProps {
  creditManagerAddress: string
  targetTokenAddress: string
  assets: Array<Asset>
}

export const getOpenStrategyPath =
  ({
    creditManagerAddress,
    assets,
    targetTokenAddress
  }: GetOpenStrategyPathProps): StrategyThunkAction =>
  async (dispatch, getState) => {
    try {
      const slippage = 50
      const {
        web3: { pathFinder }
      } = getState()
      if (!pathFinder) throw new Error('pathfinder is undefined')

      const [gotBalances, path] =
        await pathFinder.callStatic.findOpenStrategyPath(
          creditManagerAddress,
          assets,
          targetTokenAddress,
          connectorTokenAddresses,
          slippage
        )

      dispatch({
        type: 'SET_STRATEGY_PATH',
        payload: { balances: gotBalances, path }
      })
    } catch (e: any) {
      console.error('store/strategy/actions', 'Cant getStrategies', e)
      dispatch({
        type: 'SET_STRATEGY_PATH',
        payload: { balances: [], path: {} as TradePath }
      })
    }
  }
export interface OpenStrategyProps {
  creditManager: CreditManagerData
  path: TradePath
  borrowedAmount: BigNumber
  wrappedAssets: Array<Asset>
  ethAmount: BigNumber
  opHash: string
  chainId?: number
}

export const openStrategy =
  ({
    creditManager,
    path,
    borrowedAmount,
    wrappedAssets,
    ethAmount,
    opHash = '0',
    chainId = CHAIN_ID
  }: OpenStrategyProps): StrategyThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))

      const signer = getSignerOrThrow(getState)
      const {
        address: creditManagerAddress,
        underlyingToken,
        creditFacade: creditFacadeAddress
      } = creditManager
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer
      )
      const account = await signer.getAddress()

      const calls = path.calls

      const receipt = await creditFacade.openCreditAccountMulticall(
        borrowedAmount,
        account,
        calls,
        0,
        { value: ethAmount }
      )

      dispatch(openInProgressByCreditManager(creditManagerAddress))

      const evmTx = new TxOpenMultitokenAccount({
        txHash: receipt.hash,
        creditManager: creditManagerAddress,
        timestamp: receipt.timestamp || 0,
        borrowedAmount,
        underlyingToken,
        assets: wrappedAssets.map(({ token: tokenAddress }) => tokenAddress)
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getByCreditManager(creditManagerAddress, account))

            dispatch(caGetList())
            dispatch(removeOpenInProgressByCreditManager(creditManagerAddress))
            dispatch(getTokenBalances({ account }))
            dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))
          }
        })
      )
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException('store/strategy/actions', 'Cant openStrategy', e)
    }
  }
