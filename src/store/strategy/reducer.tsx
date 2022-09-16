/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { LpTokensAPY, Strategy } from '@gearbox-protocol/sdk'

import { DEFAULT_STRATEGIES } from '../../config/strategy'
import { StrategyAction, StrategyPath } from './index'

export interface StrategyState {
  apyList: LpTokensAPY | undefined
  strategies: Record<string, Strategy>
  strategyPath: null | undefined | StrategyPath
  openId: string
}

const initialState: StrategyState = {
  apyList: undefined,
  strategies: DEFAULT_STRATEGIES,
  strategyPath: null,
  openId: ''
}

export function strategyReducer(
  state: StrategyState = initialState,
  action: StrategyAction
): StrategyState {
  switch (action.type) {
    case 'SET_APY_BULK':
      return {
        ...state,
        apyList: action.payload
      }
    case 'SET_STRATEGY_BULK':
      return {
        ...state,
        strategies: action.payload
      }

    case 'CLEAR_STRATEGY_OPEN_PATH':
      return {
        ...state,
        strategyPath: null
      }
    case 'UPDATE_STRATEGY_OPEN_ID':
      return {
        ...state,
        openId: action.payload
      }
    case 'SET_STRATEGY_OPEN_PATH':
      return action.payload.openId === state.openId
        ? {
            ...state,
            strategyPath: action.payload.strategyPath
          }
        : state
    case 'STRATEGY_OPEN_PATH_NOT_FOUND':
      return action.payload === state.openId
        ? {
            ...state,
            strategyPath: undefined
          }
        : state
    default:
      return state
  }
}
