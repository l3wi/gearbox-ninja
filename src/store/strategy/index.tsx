import { Asset, LpTokensAPY, Strategy, MultiCall } from '@gearbox-protocol/sdk'
import { OperationActions } from '../operations'
import { ThunkAction } from 'redux-thunk'

import { CreditAccountsAction } from '../creditAccounts'
import type { RootState } from '../index'

export interface StrategyPath {
  balances: Array<Asset>
  calls: Array<MultiCall>
}

export type StrategyAction =
  | {
      type: 'SET_STRATEGY_BULK'
      payload: Record<string, Strategy>
    }
  | {
      type: 'SET_APY_BULK'
      payload: LpTokensAPY
    }
  | { type: 'CLEAR_STRATEGY_OPEN_PATH' }
  | { type: 'STRATEGY_OPEN_PATH_NOT_FOUND'; payload: string }
  | { type: 'UPDATE_STRATEGY_OPEN_ID'; payload: string }
  | {
      type: 'SET_STRATEGY_OPEN_PATH'
      payload: {
        strategyPath: StrategyPath
        openId: string
      }
    }

export type StrategyThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  StrategyAction | OperationActions | CreditAccountsAction
>

export const strategiesSelector = (state: RootState) =>
  state.strategy.strategies
export const strategySelector = (address: string) => (state: RootState) =>
  state.strategy.strategies[address]
export const apyListSelector = (state: RootState) => state.strategy.apyList
export const strategyOpenPathSelector = (state: RootState) =>
  state.strategy.strategyPath
