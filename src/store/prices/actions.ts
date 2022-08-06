import { BigNumber, ethers } from 'ethers'
import {
  ADDRESS_0x0,
  PriceOracle__factory,
  AddressProvider__factory
} from '@gearbox-protocol/sdk'

import { ETH_ADDRESS, WETH_ADDRESS } from '../../config/tokens'
import { ADDRESS_PROVIDER } from '../../config'

import { PriceThunkAction } from './index'

export const setTokenList =
  (tokens: Array<string>): PriceThunkAction =>
  async (dispatch) => {
    dispatch({
      type: 'PRICE_TOKEN_LIST_SET',
      payload: tokens
    })
  }

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
      const addressProvider = AddressProvider__factory.connect(
        ADDRESS_PROVIDER,
        provider
      )

      const priceOracle = PriceOracle__factory.connect(
        await addressProvider.getPriceOracle(),
        provider
      )

      const resp = await Promise.allSettled(
        tokens.map((token) => priceOracle.getPrice(ADDRESS_0x0, token))
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
      console.error('store/pice/actions', 'Cant getPricesV2', e)
    }
  }
