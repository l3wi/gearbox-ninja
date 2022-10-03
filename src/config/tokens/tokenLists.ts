import {
  decimals,
  LPTokenDataI,
  lpTokens,
  objectEntries,
  supportedTokens,
  TokenData
} from '@gearbox-protocol/sdk'

import {
  currentTokenData,
  DWETH_ADDRESS,
  ETH_ADDRESS,
  WETH_ADDRESS
} from './constants'
import { isTokenToSkip } from './helpers'

const dstwethData = new TokenData(
  {
    symbol: supportedTokens.wstETH.symbol,
    addr: currentTokenData.dwstETH.toLowerCase(),
    decimals: decimals.dwstETH
  },
  { [supportedTokens.wstETH.symbol]: supportedTokens.dwstETH.symbol }
)

export const tokenDataList = objectEntries(currentTokenData).reduce<
  Record<string, TokenData>
>((acc, [tokenSymbol, addr]) => {
  const data = supportedTokens[tokenSymbol]

  if (addr) {
    acc[addr] = new TokenData({
      ...data,
      addr,
      decimals: decimals[tokenSymbol]
    })
  }

  return {
    ...acc,
    [dstwethData.address]: dstwethData
  }
}, {})

export const priceTokenAddresses = objectEntries(currentTokenData).reduce<
  Array<string>
>((acc, [tokenSymbol, addr]) => {
  if (!isTokenToSkip(tokenSymbol)) acc.push(addr)
  return acc
}, [])

export const ethData = new TokenData(
  {
    ...supportedTokens.WETH,
    addr: ETH_ADDRESS,
    symbol: 'ETH',
    decimals: decimals.WETH
  },
  {}
)

export const wethData = new TokenData(
  { ...supportedTokens.WETH, addr: WETH_ADDRESS, decimals: decimals.WETH },
  {}
)

export const dwethData = new TokenData(
  { ...supportedTokens.dWETH, addr: DWETH_ADDRESS, decimals: decimals.dWETH },
  {}
)

export const lpTokenDataList = Object.values(lpTokens).reduce<
  Record<string, LPTokenDataI>
>((acc, token) => {
  const tokenAddress = currentTokenData[token.symbol]

  if (tokenAddress) acc[tokenAddress] = token

  return acc
}, {})
