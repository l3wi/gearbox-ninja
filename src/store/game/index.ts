import { Container } from 'melonjs'
import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'

export type GameActions =
  | {
      type: 'INIT_GAME'
    }
  | {
      type: 'PAUSE_GAME'
      payload: { pause: string }
    }
  | {
      type: 'RESUME_GAME'
    }
  | {
      type: 'REGISTER_STAGE'
      payload: { key: string; stage: any }
    }
  | {
      type: 'CHANGE_STAGE'
      payload: { currentStage: string; lastPosition?: { x: number; y: number } }
    }
  | {
      type: 'BEGIN_STAGE'
    }
  | {
      type: 'UPDATE_HUD'
    }
  | {
      type: 'UPDATE_PAUSE'
      payload: { pause: string }
    }

export type GameThunkAction = ThunkAction<void, RootState, unknown, GameActions>
