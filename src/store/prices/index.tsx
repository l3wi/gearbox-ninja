import { BigNumber } from "ethers";
import { ThunkAction } from "redux-thunk";

import { RootState } from "../index";
import { OperationActions } from "../operations";

export interface PriceAction {
  type: "PRICE_SUCCESS";
  payload: Record<string, BigNumber>;
}

export type PriceThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  PriceAction | OperationActions
>;

export const pricesSelector = (state: RootState) => state.price.prices;
