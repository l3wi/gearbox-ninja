import { Strategy, StrategyPayload } from '@gearbox-protocol/sdk'

import { currentTokenData } from './tokens'

const lidoPayload: StrategyPayload = {
  name: 'Lido',
  lpToken: currentTokenData.STETH.toLowerCase(),
  apyTokenSymbol: 'LDO',

  pools: [currentTokenData.WETH.toLowerCase()],

  unleveragableCollateral: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase(),
    currentTokenData.WBTC.toLowerCase()
  ],
  leveragableCollateral: [],

  baseAssets: [currentTokenData.WETH.toLowerCase()]
}

const fraxPayload: StrategyPayload = {
  name: 'Convex frax3crv',
  lpToken: currentTokenData.cvxFRAX3CRV.toLowerCase(),
  apyTokenSymbol: 'cvxFRAX3CRV',

  pools: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase()
  ],

  unleveragableCollateral: [
    currentTokenData.WETH.toLowerCase(),
    currentTokenData.WBTC.toLowerCase()
  ],
  leveragableCollateral: [currentTokenData.FRAX3CRV.toLowerCase()],

  baseAssets: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase(),
    currentTokenData.USDT.toLowerCase(),
    currentTokenData.FRAX.toLowerCase()
  ]
}

const lusdPayload: StrategyPayload = {
  name: 'Convex lusd3crv',
  lpToken: currentTokenData.cvxLUSD3CRV.toLowerCase(),
  apyTokenSymbol: 'cvxLUSD3CRV',

  pools: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase()
  ],

  unleveragableCollateral: [
    currentTokenData.WETH.toLowerCase(),
    currentTokenData.WBTC.toLowerCase()
  ],
  leveragableCollateral: [currentTokenData.LUSD3CRV.toLowerCase()],

  baseAssets: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase(),
    currentTokenData.USDT.toLowerCase(),
    currentTokenData.LUSD.toLowerCase()
  ]
}

const susdPayload: StrategyPayload = {
  name: 'Convex susd3crv',
  lpToken: currentTokenData.cvxcrvPlain3andSUSD.toLowerCase(),
  apyTokenSymbol: 'cvxcrvPlain3andSUSD',

  pools: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase()
  ],

  unleveragableCollateral: [
    currentTokenData.WETH.toLowerCase(),
    currentTokenData.WBTC.toLowerCase()
  ],
  leveragableCollateral: [currentTokenData.crvPlain3andSUSD.toLowerCase()],

  baseAssets: [
    currentTokenData.USDC.toLowerCase(),
    currentTokenData.DAI.toLowerCase(),
    currentTokenData.USDT.toLowerCase(),
    currentTokenData.sUSD.toLowerCase()
  ]
}

export const DEFAULT_STRATEGIES = {
  [lidoPayload.lpToken]: new Strategy(lidoPayload),
  [fraxPayload.lpToken]: new Strategy(fraxPayload),
  [lusdPayload.lpToken]: new Strategy(lusdPayload),
  [susdPayload.lpToken]: new Strategy(susdPayload)
}

export const strategiesPayload = [
  lidoPayload,
  fraxPayload,
  lusdPayload,
  susdPayload
]
