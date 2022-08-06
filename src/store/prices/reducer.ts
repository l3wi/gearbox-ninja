/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { BigNumber } from 'ethers'

import { priceTokenList } from '../../config/tokens'
import type { PriceAction } from './index'

export interface PriceState {
  prices: Record<string, BigNumber>
  tokensList: Array<string>
}

const initialState: PriceState = {
  prices: {},
  tokensList: priceTokenList
}

export function priceReducer(
  state: PriceState = initialState,
  action: PriceAction
): PriceState {
  switch (action.type) {
    case 'PRICE_TOKEN_LIST_SET':
      return {
        ...state,
        tokensList: action.payload
      }
    case 'PRICE_SUCCESS':
      return {
        ...state,
        prices: {
          ...state.prices,
          ...action.payload
        }
      }
    default:
      return state
  }
}
