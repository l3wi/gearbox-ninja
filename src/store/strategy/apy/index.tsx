import {
  ConvexLPTokenData,
  ConvexPhantomTokenData,
  isConvexToken,
  isCurveLPToken,
  isYearnLPToken,
  LPTokenDataI,
} from "@gearbox-protocol/sdk";

import { ConvexAPY } from "./convex";
import { CurveApy } from "./curve";
import { YearnApy } from "./yearn";

export * from "./convex";
export * from "./curve";
export * from "./lido";
export * from "./yearn";

export function getAPYValue(
  tokenDetails: LPTokenDataI,
  { cvx, crv, yearn }: { cvx: ConvexAPY; crv: CurveApy; yearn: YearnApy }
): number {
  const { symbol } = tokenDetails;

  if (isYearnLPToken(symbol)) {
    const apy = yearn[symbol];
    return apy;
  }
  if (isCurveLPToken(symbol)) {
    const apy = crv[symbol];
    return apy;
  }
  if (isConvexToken(symbol)) {
    const { pool } = tokenDetails as ConvexLPTokenData | ConvexPhantomTokenData;
    const apy = cvx[pool];
    return apy;
  }

  return 0;
}
