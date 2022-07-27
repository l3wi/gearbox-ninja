/*
 * Copyright (c) 2020. Mikael Lazarev
 */

import { combineReducers } from 'redux'

import { authReducer } from './auth/reducer'
import { web3Reducer } from './web3/reducer'
import { gameReducer } from './game/reducer'
import { formReducer } from './form/reducer'
import { poolsReducer } from './pools/reducer'
import { operationReducer } from './operations/reducer'
import { tokenReducer } from './tokens/reducer'
import { syncReducer } from './sync/reducer'

// eslint-disable-next-line import/no-anonymous-default-export
const reducer = combineReducers({
  web3: web3Reducer,
  auth: authReducer,
  game: gameReducer,
  form: formReducer,
  pool: poolsReducer,
  operation: operationReducer,
  token: tokenReducer,
  sync: syncReducer
})

export type RootState = ReturnType<typeof reducer>

export default reducer
