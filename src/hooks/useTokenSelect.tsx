import { BigNumber } from "ethers";
import { useCallback, useEffect, useState } from "react";

import { AssetsState } from "./useAssets";

export type SelectMode = "selectToken";

export function useTokenSelect<T extends string>(defaultMode: SelectMode | T) {
  const [mode, setMode] = useState<SelectMode | T>(defaultMode);
  const [indexToChange, setIndexToChange] = useState<null | number>(null);
  useEffect(() => {
    if (mode !== "selectToken") setIndexToChange(null);
  }, [mode]);

  const handleSetAnotherMode = useCallback(
    (nextMode: T) => () => setMode(nextMode),
    []
  );
  const handleSetModeSelect = useCallback(
    (tokenIndex: number, mode?: T) => () => {
      setIndexToChange(tokenIndex);
      setMode(mode || "selectToken");
    },
    []
  );

  return {
    mode,
    indexToChange,
    handlers: { handleSetAnotherMode, handleSetModeSelect },
  };
}

const BALANCE_THRESHOLD = BigNumber.from(10);

export function canSelect(
  targetTokenAddress: string,
  selectedTokens: AssetsState["assets"],
  balances: Record<string, BigNumber>,
  balanceThreshold: BigNumber = BALANCE_THRESHOLD
): boolean {
  const alreadySelected = selectedTokens.some(
    ({ token: tokenAddress }) => tokenAddress === targetTokenAddress
  );

  const balance = balances[targetTokenAddress] || BigNumber.from(0);
  const zeroBalance = balance.lte(balanceThreshold);

  return !alreadySelected && !zeroBalance;
}
