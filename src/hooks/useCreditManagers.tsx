import {
  CreditManagerData,
  IncorrectEthAddressError,
} from "@gearbox-protocol/sdk";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { APP_VERSION } from "../config";
import { AdapterManager } from "../config/adapterManager";
import { ETH_ADDRESS, WETH_ADDRESS } from "../config/tokens";
import actions from "../store/actions";
import {
  adapterManagerSelector,
  creditManagerErrorSelector,
  creditManagersSelector,
} from "../store/creditManagers";
import { CAListOutput } from "./useCreditAccounts";

export function useAdapterManager(address: string): AdapterManager | undefined {
  useCreditManager(address);
  const result = useSelector(adapterManagerSelector(address));
  return result;
}
import { RootState } from "../store/reducer";

export type CMListOutput = Record<string, CreditManagerData> | Error | null;

function useAllCreditManagers(): CMListOutput {
  const dispatch = useDispatch();
  const { account, signer, provider } = useSelector(
    (state: RootState) => state.web3
  );

  const cmsUnfiltered = useSelector(creditManagersSelector);
  const error = useSelector(creditManagerErrorSelector);

  useEffect(() => {
    const signerOrProvider = signer || provider;
    if (signerOrProvider) {
      // @ts-ignore
      dispatch(actions.creditManagers.getList(signerOrProvider));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, provider === undefined, signer]);

  return error || cmsUnfiltered;
}

export function useCreditManagers(): CMListOutput {
  const cmListUnfiltered = useAllCreditManagers();

  const cmList = useMemo(() => {
    if (cmListUnfiltered instanceof Error) return cmListUnfiltered;
    if (!cmListUnfiltered) return cmListUnfiltered;

    const filtered = Object.entries(cmListUnfiltered).filter(
      ([, cm]) => cm.version === APP_VERSION
    );
    return Object.fromEntries(filtered);
  }, [cmListUnfiltered]);

  return cmList;
}

export function useNotOpenedCreditManagers(
  cmList: CMListOutput,
  caList: CAListOutput
): CMListOutput {
  const notOpenedCMs = useMemo(() => {
    if (cmList instanceof Error) return cmList;
    if (caList instanceof Error) return caList;
    if (!cmList) return cmList;
    if (!caList) return cmList;

    const notOpenedCMEntries = Object.entries(cmList).filter(
      ([cmAddress]) => !caList[cmAddress]
    );

    return Object.fromEntries(notOpenedCMEntries);
  }, [cmList, caList]);

  return notOpenedCMs;
}

export function useCreditManagersByUnderlying(
  cmList: CMListOutput
): CMListOutput {
  const cmsByUnderlying = useMemo(() => {
    if (cmList instanceof Error) return cmList;
    if (!cmList) return cmList;

    return Object.values(cmList).reduce<Record<string, CreditManagerData>>(
      (acc, cm) => {
        acc[cm.underlyingToken.toLowerCase()] = cm;
        return acc;
      },
      {}
    );
  }, [cmList]);

  return cmsByUnderlying;
}

export function useCreditManager(
  address: string | undefined
): CreditManagerData | null | undefined | Error {
  const creditManagers = useCreditManagers();

  if (!address) {
    return new IncorrectEthAddressError();
  }
  if (creditManagers instanceof Error || !creditManagers) return null;

  return creditManagers[address.toLowerCase()];
}

export function useAllowedTokens(
  cm: CreditManagerData | undefined
): Array<string> {
  const allowedTokens = useMemo(
    () => (cm?.collateralTokens || []).map((address) => address.toLowerCase()),
    [cm]
  );

  return allowedTokens;
}

export function useAllowedTokensWithETH(
  cm: CreditManagerData | undefined
): Array<string> {
  const allowedTokens = useMemo(() => {
    const originalTokens = cm
      ? [...cm.collateralTokens.map((address) => address.toLowerCase())]
      : [];
    return originalTokens.includes(WETH_ADDRESS)
      ? [...originalTokens, ETH_ADDRESS]
      : originalTokens;
  }, [cm]);

  return allowedTokens;
}
