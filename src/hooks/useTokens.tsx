import {
  isNormalToken,
  TokenData,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ETH_ADDRESS, ethData, WETH_ADDRESS, wethData } from "../config/tokens";
import actions from "../store/actions";
import { RootState } from "../store/reducer";
import {
  allowancesSelector,
  tokenAllowanceSelector,
  tokenBalanceSelector,
  tokenBalancesSelector,
  tokenDataMapSelector,
  virtualTokenAllowanceSelector,
  virtualTokenAllowancesSelector,
} from "../store/tokens";

export function useTokensDataList(): Record<string, TokenData> {
  const result = useSelector(tokenDataMapSelector);
  return result;
}

export function useTokensDataListWithETH(): Record<string, TokenData> {
  const tokenList = useTokensDataList();
  const tokenListWithEth = useMemo(
    () => ({ ...tokenList, [WETH_ADDRESS]: wethData, [ETH_ADDRESS]: ethData }),
    [tokenList]
  );
  return tokenListWithEth;
}

export function useTokenData(address?: string): TokenData | undefined {
  const tokensList = useTokensDataList();
  return address ? tokensList[address.toLowerCase()] : undefined;
}

export function useTokenDataWithEth(address?: string): TokenData | undefined {
  const tokensList = useTokensDataListWithETH();
  return address ? tokensList[address.toLowerCase()] : undefined;
}

export function useTokenBalance(address = ""): BigNumber | undefined {
  const dispatch = useDispatch();
  const { account } = useSelector((state: RootState) => state.web3);

  const result = useSelector(tokenBalanceSelector(address.toLowerCase()));

  useEffect(() => {
    if (address && account) {
      // @ts-ignore
      dispatch(actions.tokens.getTokenBalance({ address, opHash: "f" }));
    }
  }, [account, address, dispatch]);

  return result;
}

export function useAllowances(
  account: string | undefined,
  to: string | undefined
): Record<string, BigNumber> {
  const dispatch = useDispatch();
  const tokensList = useTokensDataList();

  useEffect(() => {
    if (to && account) {
      // @ts-ignore
      dispatch(actions.tokens.getTokenAllowances(tokensList, to, account));
    }
  }, [tokensList, account, to, dispatch]);

  const allowances = useSelector(allowancesSelector());

  return allowances;
}

export function useTokenAllowance(
  tokenAddress?: string,
  to?: string
): BigNumber | undefined {
  const dispatch = useDispatch();
  const { account } = useSelector((state: RootState) => state.web3);
  const allowance = useSelector(
    tokenAllowanceSelector(tokenAddress || "", to || "")
  );

  useEffect(() => {
    if (tokenAddress && to && account) {
      // @ts-ignore
      dispatch(actions.tokens.getTokenAllowance({ tokenAddress, to, account }));
    }
  }, [account, tokenAddress, to, dispatch]);

  return allowance;
}

export function useVirtualTokenAllowances(): [
  Record<string, BigNumber>,
  Array<TokenData>
] {
  const vAllowances = useSelector(virtualTokenAllowancesSelector());
  const tokenList = useTokensDataList();

  const pendingTokens = useMemo(
    () =>
      Object.entries(vAllowances).map(([addressAndTo]) => {
        const [address] = addressAndTo.split("@");
        return tokenList[address];
      }),
    [vAllowances, tokenList]
  );

  return [vAllowances, pendingTokens];
}

export function useVirtualTokenAllowance(
  address?: string,
  to?: string
): BigNumber | undefined {
  const virtualAllowance = useSelector(
    virtualTokenAllowanceSelector(address || "", to || "")
  );

  return virtualAllowance;
}

export function useTokenBalances() {
  const dispatch = useDispatch();
  const { provider, balance: ethBalance } = useSelector(
    (state: RootState) => state.web3
  );

  const balances = useSelector(tokenBalancesSelector);

  const balancesWithWETH = useMemo(
    () => ({
      ...balances,
      [WETH_ADDRESS]: ethBalance,
    }),
    [balances, ethBalance]
  );

  useEffect(() => {
    if (provider) {
      // @ts-ignore
      dispatch(actions.sync.updateLastBlock(provider));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const balancesWithETHAndWETH = useMemo(
    () => ({
      ...balances,
      [ETH_ADDRESS]: ethBalance,
    }),
    [balances, ethBalance]
  );

  return [balancesWithWETH, balancesWithETHAndWETH];
}

export function useNormalTokens<V>(list: Record<string, V>): Record<string, V> {
  const r = useMemo(
    () =>
      Object.entries(list).reduce<Record<string, V>>(
        (acc, [tokenAddress, value]) => {
          const tokenAddressLc = tokenAddress.toLowerCase();
          const tokenSymbol = tokenSymbolByAddress[tokenAddressLc];
          if (isNormalToken(tokenSymbol)) acc[tokenAddressLc] = value;
          return acc;
        },
        {}
      ),
    [list]
  );

  return r;
}
