import { game, Container } from 'melonjs'
import { GameActions, GameThunkAction } from './index'
export type Stages = Record<string, any>

export interface GameState {
  isInit: boolean
  isPaused: boolean
  stages: Stages // Need to fix (Stage Class)
  lastPosition: { x: number; y: number }
  currentStage: keyof Stages
  pause: string | null
}

const initialState: GameState = {
  isInit: false,
  isPaused: false,
  stages: {},
  lastPosition: { x: 2175, y: 0 },
  currentStage: 'MENU',
  pause: null
}

export function gameReducer(
  state: GameState = initialState,
  action: GameActions
): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return {
        ...state,
        isInit: true
      }
    case 'PAUSE_GAME':
      return {
        ...state,
        isPaused: true,
        pause: action.payload.pause
      }
    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false,
        pause: null
      }
    case 'BEGIN_STAGE':
      return {
        ...state
      }
    case 'UPDATE_HUD':
      return {
        ...state
      }
    case 'UPDATE_PAUSE':
      return {
        ...state,
        pause: action.payload.pause
      }
    case 'CHANGE_STAGE':
      return {
        ...state,
        currentStage: action.payload.currentStage,
        lastPosition: action.payload.lastPosition
          ? action.payload.lastPosition
          : state.lastPosition
      }
    case 'REGISTER_STAGE':
      return {
        ...state,
        stages: { ...state.stages, [action.payload.key]: action.payload.stage }
      }
  }

  return state
}
