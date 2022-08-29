import { ThunkAction } from 'redux-thunk'
import { OperationActions } from '../operations'
import { Strategy } from '@gearbox-protocol/sdk'

import type { RootState } from '../index'

export type StrategyAction = {
  type: 'SET_STRATEGY_BULK'
  payload: Record<string, Strategy>
}

export type StrategyThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  StrategyAction | OperationActions
>

export const strategiesSelector = (state: RootState) =>
  state.strategy.strategies
export const strategySelector = (address: string) => (state: RootState) =>
  state.strategy.strategies[address]
