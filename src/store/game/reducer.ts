import { GameActions, GameThunkAction } from './index'

export interface GameState {
  isPaused: boolean
  pending: boolean
}

const initialState: GameState = {
  isPaused: false,
  pending: false
}

export function authReducer(
  state: GameState = initialState,
  action: GameActions
): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return {
        ...state
      }
    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true
      }
    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false
      }
  }

  return state
}
