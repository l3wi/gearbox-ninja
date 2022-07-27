import {
  supportedTokens,
  TokenData,
  tokenDataByNetwork,
  objectEntries,
  SupportedToken
} from '@gearbox-protocol/sdk'
import { CHAIN_ID } from '../config'

export const currentTokenData =
  tokenDataByNetwork[CHAIN_ID === 42 ? 'Kovan' : 'Mainnet']

export const tokenDataList = objectEntries(currentTokenData).reduce<
  Record<string, TokenData>
>((acc, [tokenSymbol, addr]) => {
  const data = supportedTokens[tokenSymbol]

  if (addr) {
    const addrLC = addr.toLowerCase()
    acc[addrLC] = new TokenData({ ...data, addr: addrLC })
  }

  return acc
}, {})

type TokensToSkip = Extract<
  SupportedToken,
  'dDAI' | 'dUSDC' | 'dWBTC' | 'dWETH' | 'GEAR'
>

const tokensToSkip: Record<TokensToSkip, true> = {
  dDAI: true,
  dUSDC: true,
  dWBTC: true,
  dWETH: true,
  GEAR: true
}

const isTokenToSkip = (s: string) => Boolean(tokensToSkip[s as TokensToSkip])

export const priceTokenList = objectEntries(currentTokenData).reduce<
  Array<string>
>((acc, [tokenSymbol, addr]) => {
  if (!isTokenToSkip(tokenSymbol)) acc.push(addr.toLowerCase())
  return acc
}, [])

export const ETH_ADDRESS = '0x0'.toLowerCase()
export const ethData = new TokenData({
  ...supportedTokens.WETH,
  addr: ETH_ADDRESS,
  symbol: 'ETH'
})

export const WETH_ADDRESS = currentTokenData.WETH.toLowerCase()
export const wethData = new TokenData({
  ...supportedTokens.WETH,
  addr: WETH_ADDRESS
})
