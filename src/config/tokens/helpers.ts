import {
  isConvexLPToken,
  isConvexStakedPhantomToken,
  isCurveLPToken,
  isYearnLPToken,
  LPTokenDataI,
  LPTokens,
  lpTokens,
  TradeType,
} from "@gearbox-protocol/sdk";

import {
  ETH_ADDRESS,
  STETH_ADDRESS,
  TOKENS_TO_SKIP,
  TokensToSkip,
  WETH_ADDRESS,
  WSTETH_ADDRESS,
} from "./constants";

export const isTokenToSkip = (s: string) =>
  Boolean(TOKENS_TO_SKIP[s as TokensToSkip]);

export const unwrapTokenAddress = (tokenAddress: string) => {
  if (tokenAddress.toLowerCase() === WETH_ADDRESS) {
    return ETH_ADDRESS;
  }
  if (tokenAddress.toLowerCase() === WSTETH_ADDRESS) {
    return STETH_ADDRESS;
  }

  return tokenAddress.toLowerCase();
};

function getYearnTokensOut(tokenInfo: LPTokenDataI) {
  return tokenInfo.lpActions.map((action) => {
    if (action.type === TradeType.YearnWithdraw) return [action.tokenOut];
    return [];
  });
}

function getCurveTokensOut(tokenInfo: LPTokenDataI) {
  return tokenInfo.lpActions.map((action) => {
    if (action.type === TradeType.CurveWithdrawLP) {
      return action.tokenOut;
    }
    return [];
  });
}

function getConvexTokensOut(tokenInfo: LPTokenDataI) {
  return tokenInfo.lpActions.map((action) => {
    if (action.type === TradeType.ConvexWithdrawLP) return [action.tokenOut];
    return [];
  });
}

function getConvexStakedPhantomTokensOut(tokenInfo: LPTokenDataI) {
  return tokenInfo.lpActions.map((action) => {
    if (
      action.type === TradeType.ConvexWithdraw ||
      action.type === TradeType.ConvexWithdrawAndUnwrap
    )
      return [action.tokenOut];
    return [];
  });
}

function getLPTokensOutByAction(lpTokenSymbol: LPTokens) {
  const tokenInfo = lpTokens[lpTokenSymbol];
  if (isYearnLPToken(lpTokenSymbol)) {
    const tokenInfo = lpTokens[lpTokenSymbol];
    return getYearnTokensOut(tokenInfo);
  }
  if (isCurveLPToken(lpTokenSymbol)) {
    const tokenInfo = lpTokens[lpTokenSymbol];
    return getCurveTokensOut(tokenInfo);
  }
  if (isConvexLPToken(lpTokenSymbol)) {
    return getConvexTokensOut(tokenInfo);
  }
  if (isConvexStakedPhantomToken(lpTokenSymbol)) {
    return getConvexStakedPhantomTokensOut(tokenInfo);
  }
  return [];
}

export function getLPTokenOut(lpTokenSymbol: LPTokens) {
  const tokensOut = getLPTokensOutByAction(lpTokenSymbol);
  const flattened = tokensOut.flat(1);
  const unique = [...new Set(flattened)];
  return unique;
}
