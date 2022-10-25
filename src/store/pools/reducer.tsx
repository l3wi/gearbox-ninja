import { PoolData } from "@gearbox-protocol/sdk";

import { PoolAction } from ".";

export interface PoolsState {
  data: Record<string, PoolData>;
  error: Error | undefined;
}

const initialState: PoolsState = {
  data: {},
  error: undefined,
};

export function poolsReducer(
  state: PoolsState = initialState,
  action: PoolAction
): PoolsState {
  switch (action.type) {
    case "POOL_LIST_SUCCESS":
      return {
        ...state,
        data: action.payload,
        error: undefined,
      };
    case "POOL_LIST_FAILURE":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}
