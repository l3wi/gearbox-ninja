import { ThunkAction } from 'redux-thunk'
import { BigNumber } from 'ethers'
import { OperationActions } from '../operations'

import { RootState } from '../index'

export type PriceAction =
  | {
      type: 'PRICE_TOKEN_LIST_SET'
      payload: Array<string>
    }
  | {
      type: 'PRICE_SUCCESS'
      payload: Record<string, BigNumber>
    }

export type PriceThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  PriceAction | OperationActions
>

export const pricesSelector = (state: RootState) => state.price.prices
