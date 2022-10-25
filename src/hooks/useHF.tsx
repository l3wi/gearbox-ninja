import { calcHealthFactor, CalcHealthFactorProps } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";

export function useHF({
  assets,
  prices,
  liquidationThresholds,
  underlyingToken,
  borrowed,
}: CalcHealthFactorProps): number {
  const result = useMemo(() => {
    return calcHealthFactor({
      assets,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed,
    });
  }, [assets, prices, liquidationThresholds, underlyingToken, borrowed]);

  return result;
}

export function useValueTo<T extends BigNumber | number>(
  value: T,
  condition: boolean
): T | undefined {
  const dep = BigNumber.isBigNumber(value) ? value.toHexString() : value;

  const valueOut = useMemo(
    () => (condition ? value : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [condition, dep]
  );
  return valueOut;
}
