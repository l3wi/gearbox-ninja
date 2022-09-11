import {
  IAddressProvider__factory,
  IPriceOracleV2__factory
} from '@gearbox-protocol/sdk'
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

      const priceOracle = IPriceOracleV2__factory.connect(
        await addressProvider.getPriceOracle(),
        provider
      )

      const resp = await Promise.allSettled(
        tokens.map((token) => priceOracle.getPrice(token))
      )

      console.debug(
        'missing price responses',
        resp
          .map((r, index) =>
            r.status === 'rejected' ? tokens[index] : undefined
          )
          .filter((r) => r)
      )

      const pricesArr = resp.map((p) =>
        p.status === 'fulfilled' ? p.value : BigNumber.from(0)
      )

      dispatch(parsePricesPayload(pricesArr, tokens))
    } catch (e: any) {
      captureException('store/pice/actions', 'Cant getPricesV2', e)
    }
  }
