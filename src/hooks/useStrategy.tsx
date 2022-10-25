import { Asset, CreditManagerData, Strategy } from "@gearbox-protocol/sdk";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { STRATEGY_UPDATE_DELAY } from "../config";
import { EMPTY_OBJECT } from "../config/constants";
import { lpTokenDataList } from "../config/tokens";
import actions from "../store/actions";
import { pricesSelector } from "../store/prices";
import { RootState } from "../store/reducer";
import {
  apyListSelector,
  strategiesSelector,
  strategyOpenPathSelector,
} from "../store/strategy";
import { useCreditAccounts } from "./useCreditAccounts";
import {
  useCreditManagers,
  useCreditManagersByUnderlying,
  useNotOpenedCreditManagers,
} from "./useCreditManagers";

export function useAPYSync() {
  const dispatch = useDispatch();
  const prices = useSelector(pricesSelector);
  const { provider } = useSelector((state: RootState) => state.web3);

  useEffect(() => {
    let timer: number | null = null;

    if (provider && Object.keys(prices).length > 0) {
      const apyTask = () => {
        // @ts-ignore
        dispatch(actions.strategy.getApy(provider, prices, lpTokenDataList));
      };

      apyTask();
      timer = window.setInterval(apyTask, STRATEGY_UPDATE_DELAY);
    }

    return function apyCleanup() {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, prices]);
}

export function useAPYList() {
  const apyList = useSelector(apyListSelector);

  return apyList;
}

export function useStrategiesSync() {
  const dispatch = useDispatch();
  const apyList = useSelector(apyListSelector);

  useEffect(() => {
    if (apyList) {
      // @ts-ignore
      dispatch(actions.strategy.getStrategies(apyList));
    }
  }, [apyList, dispatch]);
}

export function useStrategyList(): [
  Record<string, Strategy> | Error | null,
  Record<string, CreditManagerData> | null
] {
  const strategiesUnfiltered = useSelector(strategiesSelector);
  const cmList = useCreditManagers();
  const [caList] = useCreditAccounts();

  const cmsWithoutCA = useNotOpenedCreditManagers(cmList, caList);
  const cmsByUnderlyingToken = useCreditManagersByUnderlying(cmsWithoutCA);

  const strategies = useMemo(() => {
    if (cmsByUnderlyingToken instanceof Error) return cmsByUnderlyingToken;
    if (!cmsByUnderlyingToken) return cmsByUnderlyingToken;

    const filtered = Object.entries(strategiesUnfiltered).filter(
      ([, strategy]) => {
        return strategy.pools.some(
          (tokenAddress) => !!cmsByUnderlyingToken[tokenAddress]
        );
      }
    );

    return Object.fromEntries(filtered);
  }, [strategiesUnfiltered, cmsByUnderlyingToken]);

  const safeCMs =
    cmsByUnderlyingToken instanceof Error ? EMPTY_OBJECT : cmsByUnderlyingToken;
  // @ts-ignore
  return [strategies, safeCMs];
}

export function useStrategyCreditManagers(
  strategy: Strategy | Error | null | undefined,
  allCm: Record<string, CreditManagerData> | null
): Record<string, CreditManagerData> | null {
  const cms = useMemo(() => {
    if (!allCm) return allCm;
    if (strategy === null) return strategy;
    if (strategy instanceof Error || strategy === undefined) return {};

    return strategy.pools.reduce<Record<string, CreditManagerData>>(
      (acc, cmAddress) => {
        const cm = allCm[cmAddress];

        return cm ? { ...acc, [cmAddress]: cm } : acc;
      },
      {}
    );
  }, [strategy, allCm]);
  // @ts-ignore
  return cms;
}

export function useStrategy(
  strategyLpAddr: string
): [
  Strategy | Error | null | undefined,
  Record<string, CreditManagerData> | null
] {
  const [strategies, creditManagers] = useStrategyList();

  const strategy =
    strategies instanceof Error || !strategies
      ? strategies
      : strategies[strategyLpAddr.toLowerCase()];

  const strategyCreditManagers = useStrategyCreditManagers(
    // @ts-ignore
    strategy,
    creditManagers
  );
  // @ts-ignore
  return [strategy, strategyCreditManagers];
}

export function useOpenStrategy(
  creditManager: CreditManagerData,
  fullCMAssets: Array<Asset>,
  targetTokenAddress: string
) {
  const dispatch = useDispatch();
  const path = useSelector(strategyOpenPathSelector);
  const { slippage } = useSelector((state: RootState) => state.web3);

  useEffect(() => {
    dispatch(actions.strategy.clearOpenStrategyPath());

    dispatch(
      // @ts-ignore
      actions.strategy.getOpenStrategyPath({
        creditManager,
        assets: fullCMAssets,
        targetTokenAddress,
        slippage,
      })
    );
  }, [creditManager, fullCMAssets, targetTokenAddress, slippage, dispatch]);

  return path;
}

export function useMaxLeverage<
  P extends
    | CreditManagerData
    | Record<string, CreditManagerData>
    | null
    | undefined
>(targetToken: string, cm: P) {
  const maxLeverage = useMemo(() => {
    const array = !cm
      ? []
      : cm instanceof CreditManagerData
      ? [cm]
      : Object.values(cm);

    const lev = Strategy.maxLeverage(targetToken, array || []);

    return lev;
  }, [targetToken, cm]);

  return maxLeverage;
}
