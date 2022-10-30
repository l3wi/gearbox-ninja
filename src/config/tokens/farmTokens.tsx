import { LPTokens, objectEntries, SupportedToken } from "@gearbox-protocol/sdk";

import { currentTokenData } from "./constants";

const farmTokenSymbols: Record<LPTokens, Array<SupportedToken>> = {
  "3Crv": ["DAI", "USDC", "USDT"],
  crvFRAX: ["USDC", "FRAX"],
  steCRV: ["STETH", "WETH"],
  FRAX3CRV: ["DAI", "USDC", "USDT", "FRAX"],
  LUSD3CRV: ["DAI", "USDC", "USDT", "LUSD"],
  crvPlain3andSUSD: ["DAI", "USDC", "USDT", "sUSD"],
  gusd3CRV: ["DAI", "USDC", "USDT", "GUSD"],
  cvx3Crv: ["DAI", "USDC", "USDT"],
  cvxcrvFRAX: ["USDC", "FRAX"],
  cvxsteCRV: ["STETH", "WETH"],
  cvxFRAX3CRV: ["DAI", "USDC", "USDT", "FRAX"],
  cvxLUSD3CRV: ["DAI", "USDC", "USDT", "LUSD"],
  cvxcrvPlain3andSUSD: ["DAI", "USDC", "USDT", "sUSD"],
  cvxgusd3CRV: ["DAI", "USDC", "USDT", "GUSD"],
  stkcvx3Crv: ["STETH", "WETH"],
  stkcvxFRAX3CRV: ["DAI", "USDC", "USDT", "FRAX"],
  stkcvxgusd3CRV: ["DAI"],
  stkcvxsteCRV: ["STETH", "WETH"],
  stkcvxcrvPlain3andSUSD: ["DAI"],
  stkcvxLUSD3CRV: ["DAI", "USDC", "USDT", "LUSD"],
  stkcvxcrvFRAX: ["USDC", "FRAX"],
  yvDAI: ["DAI"],
  yvUSDC: ["USDC"],
  yvWETH: ["WETH"],
  yvWBTC: ["WBTC"],
  yvCurve_stETH: ["STETH", "WETH"],
  yvCurve_FRAX: ["DAI", "USDC", "USDT", "FRAX"],
};

export const farmTokens = Object.fromEntries(
  objectEntries(farmTokenSymbols).map(([lpToken, underlying]) => [
    lpToken,
    underlying.map(s => currentTokenData[s]),
  ]),
);
