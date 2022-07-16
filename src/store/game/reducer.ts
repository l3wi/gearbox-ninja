import { GameActions, GameThunkAction } from './index'

export type Stages = Record<string, any>

export interface GameState {
  isPaused: boolean
  stages: Stages // Need to fix (Stage Class)
  lastPosition: { x: number; y: number }
  currentStage: keyof Stages
}

const initialState: GameState = {
  isPaused: false,
  stages: {},
  lastPosition: { x: 0, y: 0 },
  currentStage: 'MENU'
}

export function gameReducer(
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
