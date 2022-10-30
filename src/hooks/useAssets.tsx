import {
  Asset,
  calcTotalPrice,
  convertByPrice,
  memoWrapETH,
  subAssets,
  sumAssets,
  TokenData,
  WrapResult,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useCallback, useMemo, useState } from "react";

import { AssetWithView } from "../config/asset";
import { ETH_ADDRESS, WETH_ADDRESS } from "../config/tokens";

const wrapETH = memoWrapETH(ETH_ADDRESS, WETH_ADDRESS);

export function useAssets(initialState: Array<AssetWithView> = []) {
  const [assets, setAssets] = useState<Array<AssetWithView>>(initialState);

  const handleAdd = useCallback(
    (tokenAddress: string) => {
      setAssets([
        ...assets,
        {
          balance: BigNumber.from(0),
          balanceView: "",
          token: tokenAddress.toLowerCase(),
        },
      ]);
    },
    [assets]
  );

  const handleRemove = useCallback(
    (removePosition: number) => () => {
      setAssets([
        ...assets.slice(0, removePosition),
        ...assets.slice(removePosition + 1),
      ]);
    },
    [assets]
  );

  const handleChangeAmount = useCallback(
    (changePosition: number) => (balance: BigNumber, balanceView: string) => {
      setAssets([
        ...assets.slice(0, changePosition),
        { ...assets[changePosition], balance, balanceView },
        ...assets.slice(changePosition + 1),
      ]);
    },
    [assets]
  );

  const handleChangeToken = useCallback(
    (changePosition: number) => (tokenAddress: string) => {
      setAssets([
        ...assets.slice(0, changePosition),
        {
          ...assets[changePosition],
          token: tokenAddress.toLowerCase(),
          balance: BigNumber.from(0),
          balanceView: "",
        },
        ...assets.slice(changePosition + 1),
      ]);
    },
    [assets]
  );

  return {
    assets,
    handlers: {
      handleAdd,
      handleRemove,
      handleChangeAmount,
      handleChangeToken,
    },
  };
}

export function useAssetsWithAmountInTarget<T extends Asset>(
  assets: Array<T>,
  targetToken: string,
  prices: Record<string, BigNumber>,
  tokensList: Record<string, TokenData>
) {
  const assetsWithAmountInTarget = useMemo(() => {
    const { decimals: toDecimals = 18 } = tokensList[targetToken] || {};
    const toPrice = prices[targetToken];

    const withAmount = assets.map((asset) => {
      const { balance: fromAmount, token: fromToken } = asset;
      const { decimals: fromDecimals = 18, address: fromAddress } =
        tokensList[fromToken] || {};
      const fromPrice = prices[fromAddress];

      const inTarget = convertByPrice(
        calcTotalPrice(fromPrice, fromAmount, fromDecimals),
        {
          price: toPrice,
          decimals: toDecimals,
        }
      );

      return { ...asset, amountInTarget: inTarget };
    });

    return withAmount;
  }, [assets, targetToken, prices, tokensList]);

  return assetsWithAmountInTarget;
}

export function useSingleAsset<
  T extends AssetWithView["balanceView"] | undefined = undefined,
  C = T extends string ? [AssetWithView] : [Asset]
>(tokenAddress: Asset["token"], amount: Asset["balance"], balanceView?: T): C {
  const hexAmount = amount.toHexString();

  const assets = useMemo(
    () =>
      balanceView === undefined
        ? [{ token: tokenAddress, balance: amount }]
        : [{ token: tokenAddress, balance: amount, balanceView }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenAddress, hexAmount, balanceView]
  ) as unknown as C;

  return assets;
}

export type AssetsState = ReturnType<typeof useAssets>;

export function useWrapETH<T extends Asset>(assets: Array<T>): WrapResult<T> {
  const wrappedAssets = useMemo(() => wrapETH(assets), [assets]);
  return wrappedAssets;
}

export function useSumAssets<A extends Asset, B extends Asset>(
  a: Array<A>,
  b: Array<B>
): Array<A | B> {
  const assetsSum = useMemo(() => sumAssets(a, b), [a, b]);
  return assetsSum;
}

export function useSubAssets<A extends Asset, B extends Asset>(
  a: Array<A>,
  b: Array<B>
): Array<A> {
  const assetsSub = useMemo(() => subAssets(a, b), [a, b]);
  return assetsSub;
}

export function useBalanceLimitedAssets<A extends Asset>(
  a: Array<A>,
  balances: Record<string, BigNumber>
): Array<A> {
  const assetsLimited = useMemo(
    () =>
      a.map((asset) => {
        const balanceOnAccount = balances[asset.token] || BigNumber.from(0);

        return {
          ...asset,
          balance: balanceOnAccount.gt(asset.balance)
            ? balanceOnAccount
            : asset.balance,
        };
      }),
    [a, balances]
  );

  return assetsLimited;
}
