import { SupportedToken, tokenDataByNetwork } from '@gearbox-protocol/sdk'

import { CHAIN_TYPE } from '../../config'

export const currentTokenData = tokenDataByNetwork[CHAIN_TYPE]

export type TokensToSkip = Extract<
  SupportedToken,
  'dDAI' | 'dUSDC' | 'dWBTC' | 'dWETH' | 'GEAR'
>

export const TOKENS_TO_SKIP: Record<TokensToSkip, true> = {
  dDAI: true,
  dUSDC: true,
  dWBTC: true,
  dWETH: true,
  GEAR: true
}

export const ETH_ADDRESS = '0x0'.toLowerCase()
export const WETH_ADDRESS = currentTokenData.WETH.toLowerCase()
