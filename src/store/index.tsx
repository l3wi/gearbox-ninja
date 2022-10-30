import { applyMiddleware, createStore, Middleware, Store } from "redux";
import thunk from "redux-thunk";

import reducer from "./reducer";
import acts from "./actions";
export type RootState = ReturnType<typeof reducer>;

// Ghetto logger
const logger: Middleware<{}, RootState> = store => next => action => {
  // Skipp logger for notifications
  if (action.type === "UPDATE_NOTIFICATION") return next(action);
  console.group(action.type);
  console.info("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  console.groupEnd();
  return result;
};

export function configureStore() {
  return createStore(reducer, applyMiddleware(thunk, logger));
}

export let store: Store<RootState>;

export const setup = () => {
  return new Promise((res, rej) => {
    store = configureStore();
    res(store);
  });
};

export const actions = acts;

export default { store, actions };
