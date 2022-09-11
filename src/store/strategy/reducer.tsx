/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { LpTokensAPY, Strategy } from '@gearbox-protocol/sdk'

import { DEFAULT_STRATEGIES } from '../../config/strategy'
import { StrategyAction, StrategyPath } from './index'

export interface StrategyState {
  apyList: LpTokensAPY | undefined
  strategies: Record<string, Strategy>
  strategyPath: null | StrategyPath
}

const initialState: StrategyState = {
  apyList: undefined,
  strategies: DEFAULT_STRATEGIES,
  strategyPath: null
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
    case 'SET_STRATEGY_PATH':
      return {
        ...state,
        strategyPath: action.payload
      }
    default:
      return state
  }
}
