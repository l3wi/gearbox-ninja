import { Asset, PERCENTAGE_FACTOR, TokenData } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";

import {
  HfError,
  OpenAccountBalanceError,
  OpenStrategyError,
  TradeError,
} from "../../config/errors";
import { StrategyPath } from "../../store/strategy";
import { shortenString } from "../../utils/format";
import { MAX_LENGTH } from "./constants";

export interface ValidateBalancesProps {
  balances: Record<string, BigNumber>;
  assets: Array<Asset>;
  tokensList: Record<string, TokenData>;
}

export function validateBalances({
  balances,
  assets,
  tokensList,
}: ValidateBalancesProps): true {
  assets.forEach(({ token: tokenAddress, balance: amount }, index) => {
    const balance = balances[tokenAddress.toLowerCase()] || BigNumber.from(0);
    const token = tokensList[tokenAddress.toLowerCase()];

    if (!token)
      throw new OpenAccountBalanceError("unknownToken", `${index + 1}`);

    if (balance.lt(amount))
      throw new OpenAccountBalanceError(
        "insufficientFunds",
        shortenString(token.symbol, MAX_LENGTH)
      );

    if (amount.lte(10))
      throw new OpenAccountBalanceError(
        "zeroBalance",
        shortenString(token.symbol, MAX_LENGTH)
      );
  });

  return true;
}

export interface ValidateStrategyOpenPathProps {
  strategyPath: StrategyPath | null | undefined;
}

export function validateStrategyOpenPath({
  strategyPath,
}: ValidateStrategyOpenPathProps): true {
  if (strategyPath === null) throw new OpenStrategyError("loadingPath", "");
  if (strategyPath === undefined)
    throw new OpenStrategyError("pathNotFound", "");

  return true;
}

export interface ValidateHFProps {
  hf: number | undefined;
}

export function validateHF({ hf }: ValidateHFProps): true {
  if (!hf || hf <= PERCENTAGE_FACTOR) throw new HfError("hfTooLow", "");
  return true;
}
