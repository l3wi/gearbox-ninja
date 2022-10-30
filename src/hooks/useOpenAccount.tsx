import {
  Asset,
  calcTotalPrice,
  convertByPrice,
  LEVERAGE_DECIMALS,
  nonNegativeBn,
  PRICE_DECIMALS,
  TokenData,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";

interface TotalAmountInUnderlyingProps {
  prices: Record<string, BigNumber>;
  assets: Array<Asset>;
  tokensList: Record<string, TokenData>;

  targetToken: TokenData | undefined;
}

export function useTotalAmountInTarget({
  assets,
  prices,
  tokensList,
  targetToken,
}: TotalAmountInUnderlyingProps): BigNumber {
  const { decimals: targetDecimals = 18, address: targetAddress = "" } =
    targetToken || {};

  const totalAmount = useMemo(() => {
    const isTarget = (address: string) => address === targetAddress;

    const [targetAmount, assetMoney] = assets.reduce(
      ([u, a], { balance: assetAmount, token: tokenAddress }) => {
        const tokenAddressLC = tokenAddress.toLowerCase();
        const safeAmount = nonNegativeBn(assetAmount);

        const safePrice = prices[tokenAddressLC] || BigNumber.from(0);
        const token = tokensList[tokenAddressLC];

        if (isTarget(tokenAddressLC)) {
          return [u.add(safeAmount), a];
        }

        const money = calcTotalPrice(safePrice, safeAmount, token?.decimals);
        return [u, a.add(money)];
      },
      [BigNumber.from(0), BigNumber.from(0)]
    );

    const targetPrice = prices[targetAddress] || PRICE_DECIMALS;
    const assetAmountInUnderlying = convertByPrice(assetMoney, {
      price: targetPrice,
      decimals: targetDecimals,
    });

    return targetAmount.add(assetAmountInUnderlying);
  }, [assets, tokensList, targetDecimals, targetAddress, prices]);

  return totalAmount;
}

export function useLeveragedAmount(totalAmount: BigNumber, leverage: number) {
  const hexTotalAmount = totalAmount.toHexString();

  const stats = useMemo(() => {
    if (totalAmount.gt(0)) {
      const amountOnAccount = totalAmount.mul(leverage).div(LEVERAGE_DECIMALS);

      const borrowedAmount = totalAmount
        .mul(leverage - LEVERAGE_DECIMALS)
        .div(LEVERAGE_DECIMALS);

      return [amountOnAccount, borrowedAmount];
    }

    return [BigNumber.from(0), BigNumber.from(0)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leverage, hexTotalAmount]);

  return stats;
}
