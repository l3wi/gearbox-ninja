import {
  LPTokenDataI,
  lpTokens,
  objectEntries,
  supportedTokens,
  TokenData
} from '@gearbox-protocol/sdk'

import { currentTokenData, ETH_ADDRESS, WETH_ADDRESS } from './constants'
import { isTokenToSkip } from './helpers'

export const tokenDataList = objectEntries(currentTokenData).reduce<
  Record<string, TokenData>
>((acc, [tokenSymbol, addr]) => {
  const data = supportedTokens[tokenSymbol]

  if (addr) {
    acc[addr.toLowerCase()] = new TokenData({ ...data, addr })
  }
  delete acc['TODO: DEPLOY ME'] // Remove GEAR token placehodler

  return acc
}, {})

export const priceTokenAddresses = objectEntries(currentTokenData).reduce<
  Array<string>
>((acc, [tokenSymbol, addr]) => {
  if (!isTokenToSkip(tokenSymbol)) acc.push(addr)
  return acc
}, [])

export const ethData = new TokenData(
  { ...supportedTokens.WETH, addr: ETH_ADDRESS, symbol: 'ETH' },
  {}
)

export const wethData = new TokenData(
  { ...supportedTokens.WETH, addr: WETH_ADDRESS },
  {}
)

export const lpTokenDataList = Object.values(lpTokens).reduce<
  Record<string, LPTokenDataI>
>((acc, token) => {
  const tokenAddress = currentTokenData[token.symbol]

  if (tokenAddress) acc[tokenAddress] = token

  return acc
}, {})
