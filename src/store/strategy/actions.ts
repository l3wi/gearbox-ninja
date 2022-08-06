import { BigNumber, ethers } from 'ethers'
import { Strategy, PRICE_DECIMALS, getNetworkType } from '@gearbox-protocol/sdk'

import { CHAIN_ID } from '../../config'
import {
  lidoPayload,
  fraxPayload,
  lusdPayload,
  susdPayload
} from '../../config/strategy'

import { StrategyThunkAction } from './index'

import { lidoAPY } from './lido'
import { convexAPY } from './convex'

export const getStrategies =
  (
    provider: ethers.providers.JsonRpcProvider,
    prices: Record<string, BigNumber>
  ): StrategyThunkAction =>
  async (dispatch) => {
    try {
      const network = getNetworkType(CHAIN_ID)

      const providePrice = (t: string = '') => {
        const price = prices[t?.toLowerCase()]
        return price || PRICE_DECIMALS
      }

      const [lidoAPYRes, fraxAPY, lusdAPY, susdAPY] = await Promise.allSettled([
        lidoAPY(provider, network),
        convexAPY('CONVEX_FRAX3CRV_POOL', provider, network, providePrice),
        convexAPY('CONVEX_LUSD3CRV_POOL', provider, network, providePrice),
        convexAPY('CONVEX_SUSD_POOL', provider, network, providePrice)
      ])

      dispatch({
        type: 'SET_STRATEGY_BULK',
        payload: {
          [lidoPayload.lpToken]: new Strategy({
            ...lidoPayload,
            apy: lidoAPYRes.status === 'fulfilled' ? lidoAPYRes.value : 0
          }),
          [fraxPayload.lpToken]: new Strategy({
            ...fraxPayload,
            apy: fraxAPY.status === 'fulfilled' ? fraxAPY.value : 0
          }),
          [lusdPayload.lpToken]: new Strategy({
            ...lusdPayload,
            apy: lusdAPY.status === 'fulfilled' ? lusdAPY.value : 0
          }),
          [susdPayload.lpToken]: new Strategy({
            ...susdPayload,
            apy: susdAPY.status === 'fulfilled' ? susdAPY.value : 0
          })
        }
      })
    } catch (e: any) {
      console.error('store/pice/actions', 'Cant getStrategies', e)
    }
  }
