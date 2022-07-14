/*
 * Copyright (c) 2020. Mikael Lazarev
 */

import { applyMiddleware, Middleware, compose, createStore } from 'redux'
import reducer from './reducer'
import thunk from 'redux-thunk'

let composeEnhancers: typeof compose

export type RootState = ReturnType<typeof reducer>

const logger: Middleware<{}, RootState> = (store) => (next) => (action) => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

function configureStore() {
  return createStore(reducer, applyMiddleware(thunk, logger))
}

export let store: any

export const init = () => {
  store = configureStore()
}

export default { store, init }
