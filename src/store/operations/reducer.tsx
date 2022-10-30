import { Operation, OperationActions } from "./";

export type OperationState = Record<string, Operation>;
const initialState: OperationState = {};

export function operationReducer(
  state: OperationState = initialState,
  action: OperationActions
): OperationState {
  switch (action.type) {
    case "OPERATION_REQUEST":
    case "OPERATION_FAILURE":
    case "OPERATION_SUCCESS":
      const { payload } = action;
      return {
        ...state,
        [payload.id]: payload,
      };
    default:
      return state;
  }
}
