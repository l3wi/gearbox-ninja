/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { Strategy } from '@gearbox-protocol/sdk'

import { DEFAULT_STRATEGIES } from '../../config/strategy'
import { StrategyAction } from './index'

export interface StrategyState {
  strategies: Record<string, Strategy>
}

const initialState: StrategyState = {
  strategies: DEFAULT_STRATEGIES
}

export function strategyReducer(
  state: StrategyState = initialState,
  action: StrategyAction
): StrategyState {
  switch (action.type) {
    case 'SET_STRATEGY_BULK':
      return {
        ...state,
        strategies: action.payload
      }
    default:
      return state
  }
}
