import { game, Container } from 'melonjs'
import { GameActions, GameThunkAction } from './index'
import HUD from '../../game/renderables/hud'
export type Stages = Record<string, any>

export interface GameState {
  isInit: boolean
  isPaused: boolean
  stages: Stages // Need to fix (Stage Class)
  lastPosition: { x: number; y: number }
  currentStage: keyof Stages
  hud: Container
  pause: Container
}

const initialState: GameState = {
  isInit: false,
  isPaused: false,
  stages: {},
  lastPosition: { x: 2175, y: 0 },
  currentStage: 'MENU',
  hud: null,
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
        isPaused: true
      }
    case 'RESUME_GAME':
      return {
        ...state,
        isPaused: false
      }
    case 'BEGIN_STAGE':
      return {
        ...state,
        hud: action.payload.hud,
        pause: action.payload.pause
      }
    case 'UPDATE_HUD':
      return {
        ...state,
        hud: action.payload.hud
      }
    case 'UPDATE_PAUSE':
      const index = game.world.children.findIndex(
        (item: any, i: number) => item.name === 'PAUSE'
      )
      game.world.children[index] = action.payload.pause
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
