/*
 * Copyright (c) 2020. Mikael Lazarev
 */

import { combineReducers } from 'redux'

import { web3Reducer } from './web3/reducer'
import { gameReducer } from './game/reducer'
import { formReducer } from './form/reducer'
import { poolsReducer } from './pools/reducer'
import { operationReducer } from './operations/reducer'
import { tokenReducer } from './tokens/reducer'
import { syncReducer } from './sync/reducer'
import { strategyReducer } from './strategy/reducer'
import { priceReducer } from './prices/reducer'
import { creditAccountsReducer } from './creditAccounts/reducer'
import { creditManagerReducer } from './creditManagers/reducer'

// eslint-disable-next-line import/no-anonymous-default-export
const reducer = combineReducers({
  game: gameReducer,
  form: formReducer,

  web3: web3Reducer,
  pools: poolsReducer,
  operations: operationReducer,
  tokens: tokenReducer,
  sync: syncReducer,
  price: priceReducer,
  creditAccounts: creditAccountsReducer,
  creditManagers: creditManagerReducer,
  strategy: strategyReducer
})

export type RootState = ReturnType<typeof reducer>

export default reducer
