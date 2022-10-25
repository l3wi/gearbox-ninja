import {
  ConvexPoolContract,
  getConvexAPY as getConvexAPYSdk,
  GetConvexAPYProps,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  toSignificant,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";

export type ConvexAPY = Record<ConvexPoolContract, number>;

const CONVEX_POOLS: Array<ConvexPoolContract> = [
  "CONVEX_3CRV_POOL",
  "CONVEX_GUSD_POOL",
  "CONVEX_SUSD_POOL",
  "CONVEX_STECRV_POOL",
  "CONVEX_FRAX3CRV_POOL",
  "CONVEX_LUSD3CRV_POOL",
];

export async function getConvexAPY(
  props: Omit<GetConvexAPYProps, "pool">
): Promise<ConvexAPY> {
  const cvx = await Promise.allSettled(
    CONVEX_POOLS.map((pool) => getConvexAPYSdk({ ...props, pool }))
  );

  const cvxMap = cvx.reduce<ConvexAPY>((acc, res, index) => {
    const poolName = CONVEX_POOLS[index];

    const apyInPercent =
      res.status === "fulfilled"
        ? res.value.mul(PERCENTAGE_DECIMALS)
        : BigNumber.from(0);

    acc[poolName] = Math.round(
      Number(
        toSignificant(apyInPercent.mul(PERCENTAGE_FACTOR), WAD_DECIMALS_POW)
      )
    );
    return acc;
  }, {} as ConvexAPY);

  return cvxMap;
}
