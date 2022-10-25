import { isMetamaskError } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";

export type OpenAccountBalanceErrorTypes =
  | "unknownToken"
  | "insufficientFunds"
  | "zeroBalance";

export class OpenAccountBalanceError extends Error {
  message: OpenAccountBalanceErrorTypes;

  payload: { tokenSymbol: string };

  constructor(errorType: OpenAccountBalanceErrorTypes, tokenSymbol: string) {
    super();
    this.message = errorType;
    this.payload = { tokenSymbol };
  }

  static isOpenAccountBalanceError(e: unknown): e is OpenAccountBalanceError {
    return e instanceof OpenAccountBalanceError;
  }
}

export type OpenStrategyErrorTypes = "loadingPath" | "pathNotFound";

export class OpenStrategyError extends Error {
  message: OpenStrategyErrorTypes;

  payload: { tokenSymbol: string };

  constructor(errorType: OpenStrategyErrorTypes, tokenSymbol: string) {
    super();
    this.message = errorType;
    this.payload = { tokenSymbol };
  }

  static isOpenStrategyError(e: unknown): e is OpenStrategyError {
    return e instanceof OpenStrategyError;
  }
}

export type TradeErrorTypes = "pathNotFound" | "loadingPath";

export class TradeError extends Error {
  message: TradeErrorTypes;

  payload: { tokenSymbol: string };

  constructor(errorType: TradeErrorTypes, tokenSymbol: string) {
    super();
    this.message = errorType;
    this.payload = { tokenSymbol };
  }

  static isTradeError(e: unknown): e is TradeError {
    return e instanceof TradeError;
  }
}

export type CloseAccountErrorTypes =
  | "pathNotFound"
  | "loadingPath"
  | "insufficientFunds";

export class CloseAccountError extends Error {
  message: CloseAccountErrorTypes;

  payload: { tokenSymbol: string };

  constructor(errorType: CloseAccountErrorTypes, tokenSymbol: string) {
    super();
    this.message = errorType;
    this.payload = { tokenSymbol };
  }

  static isCloseError(e: unknown): e is CloseAccountError {
    return e instanceof CloseAccountError;
  }
}

export type HfErrorTypes = "hfTooLow";

export class HfError extends Error {
  message: HfErrorTypes;

  payload: { tokenSymbol: string };

  constructor(errorType: HfErrorTypes, tokenSymbol: string) {
    super();
    this.message = errorType;
    this.payload = { tokenSymbol };
  }

  static isHfError(e: unknown): e is HfError {
    return e instanceof HfError;
  }
}

export type BorrowMoreErrorTypes =
  | "amountGreaterMax"
  | "insufficientPoolLiquidity"
  | "amountLessMin";

export class BorrowMoreError extends Error {
  message: BorrowMoreErrorTypes;

  payload: { amount: BigNumber };

  constructor(errorType: BorrowMoreErrorTypes, amount: BigNumber) {
    super();
    this.message = errorType;
    this.payload = { amount };
  }

  static isBorrowMoreErrorError(e: unknown): e is BorrowMoreError {
    return e instanceof BorrowMoreError;
  }
}

export const isCancelledByUser = (e: any) => {
  if ((isMetamaskError(e) && e.code === 4001) || e.code === "ACTION_REJECTED") {
    return true;
  }
  return false;
};
