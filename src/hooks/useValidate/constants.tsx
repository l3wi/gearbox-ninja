import { OpenAccountErrorTypes } from '@gearbox-protocol/sdk'
import { LocaleKeys } from '../../locale/en'

import {
  BorrowMoreErrorTypes,
  CloseAccountErrorTypes,
  HfErrorTypes,
  OpenAccountBalanceErrorTypes,
  OpenStrategyErrorTypes,
  TradeErrorTypes
} from '../../config/errors'

export const MAX_LENGTH = 15

export const idByBalanceError: Record<
  OpenAccountBalanceErrorTypes,
  LocaleKeys
> = {
  insufficientFunds: 'errors.openAccount.balance.insufficientFunds',
  unknownToken: 'errors.openAccount.balance.unknownToken',
  zeroBalance: 'errors.openAccount.balance.zeroBalance'
}

export const idByOpenError: Record<OpenAccountErrorTypes, LocaleKeys> = {
  insufficientPoolLiquidity: 'errors.insufficientPoolLiquidity',
  leverageGreaterMax: 'errors.openAccount.leverageGreaterMax',
  amountGreaterMax: 'errors.openAccount.debtGreaterMax',
  amountLessMin: 'errors.openAccount.debtLessMin',
  wrongLeverage: 'errors.openAccount.wrongLeverage'
}

export const idByOpenStrategyError: Record<OpenStrategyErrorTypes, LocaleKeys> =
  {
    pathNotFound: 'errors.openStrategy.pathNotFound',
    loadingPath: 'common.loading'
  }

export const idByTradeError: Record<TradeErrorTypes, LocaleKeys> = {
  pathNotFound: 'errors.trade.pathNotFound',
  loadingPath: 'common.loading'
}

export const idByHFError: Record<HfErrorTypes, LocaleKeys> = {
  hfTooLow: 'errors.hf.lessThanOne'
}

export const idByCloseAccountError: Record<CloseAccountErrorTypes, LocaleKeys> =
  {
    pathNotFound: 'errors.trade.pathNotFound',
    loadingPath: 'common.loading',
    insufficientFunds: 'errors.insufficientFunds'
  }

export const idByCBorrowMoreError: Record<BorrowMoreErrorTypes, LocaleKeys> = {
  insufficientPoolLiquidity: 'errors.insufficientPoolLiquidity',
  amountGreaterMax: 'errors.borrow.amountGreaterMax',
  amountLessMin: 'errors.openAccount.debtLessMin'
}
