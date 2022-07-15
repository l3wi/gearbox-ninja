import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'

export const endpoint_user = '/api'

export type GameActions =
  | {
      type: 'INIT_GAME'
    }
  | {
      type: 'PAUSE_GAME'
      payload: { music?: boolean }
    }
  | {
      type: 'RESUME_GAME'
    }
  | {
      type: 'RESTART_GAME'
    }

export type GameThunkAction = ThunkAction<void, RootState, unknown, GameActions>
