import {
  keyToLowercase,
  SupportedToken,
  swapKeyValue,
  tokenDataByNetwork
} from '@gearbox-protocol/sdk'

import { CHAIN_TYPE } from '../../config'

const tokensToFilter: Record<string, true> = {
  '1INCH': true,
  AAVE: true,
  COMP: true,
  DPI: true,
  FEI: true,
  LINK: true,
  UNI: true,
  YFI: true,
  'deploy me': true
}

const filtered = Object.fromEntries(
  Object.entries(tokenDataByNetwork[CHAIN_TYPE]).filter(
    ([, value]) => !tokensToFilter[value.toLowerCase()]
  )
) as Record<SupportedToken, string>

export const currentTokenData = swapKeyValue(
  keyToLowercase(swapKeyValue(filtered))
)

export type TokensToSkip = Extract<
  SupportedToken,
  | 'dDAI'
  | 'dUSDC'
  | 'dWBTC'
  | 'dWETH'
  | 'GEAR'
  | 'wstETH'
  | '1INCH'
  | 'AAVE'
  | 'COMP'
  | 'DPI'
  | 'FEI'
  | 'LINK'
  | 'UNI'
  | 'YFI'
  | 'dwstETH'
>

export const TOKENS_TO_SKIP: Record<TokensToSkip, true> = {
  '1INCH': true,
  AAVE: true,
  COMP: true,
  DPI: true,
  FEI: true,
  LINK: true,
  UNI: true,
  YFI: true,
  dDAI: true,
  dUSDC: true,
  dWBTC: true,
  dWETH: true,
  GEAR: true,
  wstETH: true,
  dwstETH: true
}

export const ETH_ADDRESS = '0x0'.toLowerCase()
export const WETH_ADDRESS = currentTokenData.WETH

export const DWETH_ADDRESS = currentTokenData.dWETH

export const STETH_ADDRESS = currentTokenData.STETH
export const WSTETH_ADDRESS = currentTokenData.wstETH
