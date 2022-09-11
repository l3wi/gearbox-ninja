import { Asset, LpTokensAPY, Strategy } from '@gearbox-protocol/sdk'
import { OperationActions } from '../operations'
import { ThunkAction } from 'redux-thunk'

import { TradePath } from '../../config/closeTradePath'
import { CreditAccountsAction } from '../creditAccounts'
import type { RootState } from '../index'

export interface StrategyPath {
  balances: Array<Asset>
  path: TradePath
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
  | {
      type: 'SET_STRATEGY_PATH'
      payload: null | StrategyPath
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
