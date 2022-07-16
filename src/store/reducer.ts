/*
 * Copyright (c) 2020. Mikael Lazarev
 */

import { combineReducers } from 'redux'

import { authReducer } from './auth/reducer'
import { web3Reducer } from './web3/reducer'
import { gameReducer } from './game/reducer'

// eslint-disable-next-line import/no-anonymous-default-export
const reducer = combineReducers({
  web3: web3Reducer,
  auth: authReducer,
  game: gameReducer
})

export type RootState = ReturnType<typeof reducer>

export default reducer
