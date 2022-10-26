import {
  PERCENTAGE_FACTOR,
  PoolData,
  PRICE_DECIMALS,
  PRICE_DECIMALS_POW,
  toBN,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getFarmingAPY } from "../config/pool";
import {
  ETH_ADDRESS,
  STETH_ADDRESS,
  WETH_ADDRESS,
  WSTETH_ADDRESS,
} from "../config/tokens";
import { RootState } from "../store";
import actions from "../store/actions";
import { poolsListErrorSelector, poolsListSelector } from "../store/pools";

export function usePools(): Record<string, PoolData> | Error {
  const dispatch = useDispatch();
  const { signer, dataCompressor, provider } = useSelector(
    (state: RootState) => state.web3,
  );
  const result = useSelector(poolsListSelector);
  const error = useSelector(poolsListErrorSelector);

  useEffect(() => {
    if (dataCompressor && provider) {
      dispatch(actions.pools.getList());
    }
  }, [dataCompressor, signer, provider, dispatch]);

  return error || result;
}

export function usePool(address: string): PoolData | undefined | Error {
  const pools = usePools();

  return pools instanceof Error ? pools : pools[address.toLowerCase()];
}

export function usePoolAllowedTokens(underlyingToken: string) {
  const allowedToken = useMemo(() => {
    if (underlyingToken === WETH_ADDRESS) {
      return [WETH_ADDRESS, ETH_ADDRESS];
    }
    if (underlyingToken === WSTETH_ADDRESS) {
      return [WSTETH_ADDRESS, STETH_ADDRESS];
    }

    return [underlyingToken];
  }, [underlyingToken]);

  return allowedToken;
}

interface UsePoolAPYProps {
  depositAPY: number;
  underlying: {
    price: BigNumber | undefined;
    decimals: number;
    amount: BigNumber;
  };
  diesel: {
    token: string;
  };
  gear: {
    price: BigNumber | undefined;
  };
}

export function usePoolAPY({
  depositAPY,
  underlying: {
    amount: underlingAmount,
    decimals: underlyingDecimals,
    price: underlyingPrice,
  },
  diesel: { token },
  gear: { price: gearPrice },
}: UsePoolAPYProps) {
  const farmAPY = useMemo(() => {
    const safeUnderlyingPrice = underlyingPrice || PRICE_DECIMALS;

    const safeGearPrice = gearPrice || toBN("0.02", PRICE_DECIMALS_POW);

    return getFarmingAPY({
      underlying: {
        amount: underlingAmount,
        decimals: underlyingDecimals,
        price: safeUnderlyingPrice,
      },
      diesel: { token },
      gear: {
        price: safeGearPrice,
      },
    });
  }, [underlingAmount, underlyingPrice, gearPrice, underlyingDecimals, token]);

  const totalAPY = useMemo(() => {
    return (
      depositAPY +
      (underlyingPrice !== undefined ? farmAPY / PERCENTAGE_FACTOR : 0)
    );
  }, [farmAPY, underlyingPrice, depositAPY]);

  return [totalAPY, depositAPY, farmAPY];
}
