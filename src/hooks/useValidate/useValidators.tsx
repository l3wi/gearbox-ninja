import {
  CreditManagerData,
  formatBN,
  OpenAccountError,
  TokenData,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";

import {
  BorrowMoreError,
  HfError,
  OpenAccountBalanceError,
  OpenStrategyError,
  TradeError,
} from "../../config/errors";
import { useIntlTyped } from "../../utils/typedIntl";
import {
  idByBalanceError,
  idByCBorrowMoreError,
  idByHFError,
  idByOpenError,
  idByOpenStrategyError,
  idByTradeError,
} from "./constants";
import {
  validateBalances,
  ValidateBalancesProps,
  validateHF,
  ValidateHFProps,
  validateStrategyOpenPath,
  ValidateStrategyOpenPathProps,
} from "./validators";

export interface ValidateCAProps {
  tokensList: Record<string, TokenData>;
  cm: CreditManagerData;
  amount: BigNumber;
  debt: BigNumber;
}

export function useValidateCA({
  tokensList,

  cm,
  amount,
  debt,
}: ValidateCAProps) {
  const intl = useIntlTyped();
  const hexDebt = debt.toHexString();
  const hexAmount = amount.toHexString();

  const errorString = useMemo(() => {
    try {
      cm.validateOpenAccount(amount, debt);
      return null;
    } catch (e) {
      if (OpenAccountError.isOpenAccountError(e)) {
        const { decimals: underlyingDecimals = 18 } =
          tokensList[cm.underlyingToken.toLowerCase()] || {};

        const intlId = idByOpenError[e.message];

        return intl.formatMessage(
          { id: intlId },
          { amount: formatBN(e.payload.amount, underlyingDecimals) }
        );
      }

      return intl.formatMessage({ id: "errors.unknownError" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intl, tokensList, hexAmount, hexDebt, cm]);

  return errorString;
}

export function useValidateAssetsAmount({
  balances,
  assets,
  tokensList,
}: ValidateBalancesProps) {
  const intl = useIntlTyped();

  const errorString = useMemo(() => {
    try {
      validateBalances({ balances, assets, tokensList });

      return null;
    } catch (e) {
      if (OpenAccountBalanceError.isOpenAccountBalanceError(e)) {
        return intl.formatMessage(
          { id: idByBalanceError[e.message] },
          { symbol: e.payload.tokenSymbol }
        );
      }

      return intl.formatMessage({ id: "errors.unknownError" });
    }
  }, [intl, balances, assets, tokensList]);

  return errorString;
}

export function useValidateStrategy({
  strategyPath,
}: ValidateStrategyOpenPathProps) {
  const intl = useIntlTyped();

  const errorString = useMemo(() => {
    try {
      validateStrategyOpenPath({
        strategyPath,
      });
      return null;
    } catch (e) {
      if (OpenStrategyError.isOpenStrategyError(e)) {
        return intl.formatMessage(
          { id: idByOpenStrategyError[e.message] },
          { symbol: e.payload.tokenSymbol }
        );
      }

      return intl.formatMessage({ id: "errors.unknownError" });
    }
  }, [intl, strategyPath]);

  return errorString;
}

export function useValidateHF({ hf }: ValidateHFProps) {
  const intl = useIntlTyped();

  const errorString = useMemo(() => {
    try {
      validateHF({ hf });
      return null;
    } catch (e) {
      if (HfError.isHfError(e)) {
        return intl.formatMessage(
          { id: idByHFError[e.message] },
          { symbol: e.payload.tokenSymbol }
        );
      }

      return intl.formatMessage({ id: "errors.unknownError" });
    }
  }, [intl, hf]);

  return errorString;
}
