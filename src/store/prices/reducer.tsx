/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { BigNumber } from 'ethers'

import { priceTokenAddresses } from '../../config/tokens/tokenLists'
import type { PriceAction } from './index'

export interface PriceState {
  prices: Record<string, BigNumber>
  tokensList: Array<string>
}

const initialState: PriceState = {
  prices: {},
  tokensList: priceTokenAddresses
}

export function priceReducer(
  state: PriceState = initialState,
  action: PriceAction
): PriceState {
  switch (action.type) {
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
