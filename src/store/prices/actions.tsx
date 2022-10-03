import {
  AwaitedRes,
  callRepeater,
  IAddressProvider__factory,
  IPriceOracleV2__factory,
  MCall,
  multicall
} from '@gearbox-protocol/sdk'
import {
  IPriceOracleV2,
  IPriceOracleV2Interface
} from '@gearbox-protocol/sdk/lib/types/contracts/interfaces/IPriceOracle.sol/IPriceOracleV2'
import { BigNumber, ethers } from 'ethers'

import { ADDRESS_PROVIDER } from '../../config'
import { ETH_ADDRESS, WETH_ADDRESS } from '../../config/tokens'
import { captureException } from '../../utils/errors'
import { PriceThunkAction } from './index'

export const parsePricesPayload =
  (pricesArray: Array<BigNumber>, tokens: string[]): PriceThunkAction =>
  async (dispatch) => {
    const prices = tokens.reduce<Record<string, BigNumber>>(
      (acc, address, n) => {
        const price = pricesArray[n] || BigNumber.from(0)

        acc[address.toLowerCase()] = price

        return acc
      },
      {}
    )

    dispatch({
      type: 'PRICE_SUCCESS',
      payload: {
        ...prices,
        [ETH_ADDRESS]: prices[WETH_ADDRESS] || BigNumber.from(0)
      }
    })
  }

export const getPrices =
  (
    provider: ethers.providers.JsonRpcProvider,
    tokens: string[]
  ): PriceThunkAction =>
  async (dispatch) => {
    try {
      const addressProvider = IAddressProvider__factory.connect(
        ADDRESS_PROVIDER,
        provider
      )
      const priceOracleAddress = await addressProvider.getPriceOracle()

      const calls: Array<MCall<IPriceOracleV2Interface>> = tokens.map(
        (token) => ({
          address: priceOracleAddress,
          interface: IPriceOracleV2__factory.createInterface(),
          method: 'getPrice(address)',
          params: [token]
        })
      )

      const pricesResp = await callRepeater(() =>
        multicall<Array<AwaitedRes<IPriceOracleV2['getPrice']>>>(
          calls,
          provider
        )
      )

      dispatch(parsePricesPayload(pricesResp, tokens))
    } catch (e: any) {
      captureException('store/pice/actions', 'Cant getPricesV2', e)
    }
  }
