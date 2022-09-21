import { Strategy, StrategyPayload } from '@gearbox-protocol/sdk'

import { currentTokenData } from './tokens'

const lidoStETHPayload: StrategyPayload = {
  name: 'Lido stETH',
  lpToken: currentTokenData.STETH,

  unleveragableCollateral: [currentTokenData.USDC, currentTokenData.DAI],
  leveragableCollateral: [currentTokenData.STETH, currentTokenData.WETH],

  pools: [currentTokenData.WETH],
  baseAssets: [currentTokenData.WETH]
}

const yearnDAIPayload: StrategyPayload = {
  name: 'Yearn DAI',
  lpToken: currentTokenData.yvDAI,

  unleveragableCollateral: [
    currentTokenData.USDC,
    currentTokenData.WETH,
    currentTokenData.WBTC
  ],
  leveragableCollateral: [currentTokenData.DAI],

  pools: [currentTokenData.DAI],
  baseAssets: [currentTokenData.DAI]
}

const yearnUSDCPayload: StrategyPayload = {
  name: 'Yearn USDC',
  lpToken: currentTokenData.yvUSDC,

  unleveragableCollateral: [
    currentTokenData.DAI,
    currentTokenData.WETH,
    currentTokenData.WBTC
  ],
  leveragableCollateral: [currentTokenData.USDC],

  pools: [currentTokenData.USDC],
  baseAssets: [currentTokenData.USDC]
}

const yearnWETHPayload: StrategyPayload = {
  name: 'Yearn WETH',
  lpToken: currentTokenData.yvWETH,

  unleveragableCollateral: [
    currentTokenData.WBTC,
    currentTokenData.USDC,
    currentTokenData.DAI
  ],
  leveragableCollateral: [currentTokenData.WETH],

  pools: [currentTokenData.WETH],
  baseAssets: [currentTokenData.WETH]
}

const yearnWBTCPayload: StrategyPayload = {
  name: 'Yearn WBTC',
  lpToken: currentTokenData.yvWBTC,

  unleveragableCollateral: [
    currentTokenData.WETH,
    currentTokenData.USDC,
    currentTokenData.DAI
  ],
  leveragableCollateral: [currentTokenData.WBTC],

  pools: [currentTokenData.WBTC],
  baseAssets: [currentTokenData.WBTC]
}

const yearnStETHCrvPayload: StrategyPayload = {
  name: 'Yearn stETHCrv',
  lpToken: currentTokenData.yvCurve_stETH,

  unleveragableCollateral: [
    currentTokenData.WBTC,
    currentTokenData.USDC,
    currentTokenData.DAI
  ],
  leveragableCollateral: [
    currentTokenData.STETH,
    currentTokenData.WETH,
    currentTokenData.yvCurve_stETH
  ],

  pools: [currentTokenData.WETH],
  baseAssets: [currentTokenData.WETH, currentTokenData.STETH]
}

const yearnFrax3CrvPayload: StrategyPayload = {
  name: 'Yearn Frax3Crv',
  lpToken: currentTokenData.yvCurve_FRAX,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,

    currentTokenData.DAI,
    currentTokenData.FRAX3CRV,
    currentTokenData.yvCurve_FRAX
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI
  ]
}

const curveStETHCrvPayload: StrategyPayload = {
  name: 'Curve stETHCrv',
  lpToken: currentTokenData.steCRV,

  unleveragableCollateral: [
    currentTokenData.WBTC,
    currentTokenData.USDC,
    currentTokenData.DAI
  ],
  leveragableCollateral: [
    currentTokenData.STETH,
    currentTokenData.WETH,
    currentTokenData.steCRV
  ],

  pools: [currentTokenData.WETH],
  baseAssets: [currentTokenData.WETH, currentTokenData.STETH]
}

const curveFrax3CrvPayload: StrategyPayload = {
  name: 'Curve Frax3Crv',
  lpToken: currentTokenData.FRAX3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI,
    currentTokenData.FRAX3CRV
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI
  ]
}

const curve3CrvPayload: StrategyPayload = {
  name: 'Curve 3Crv',
  lpToken: currentTokenData['3Crv'],

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData['3Crv']
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI
  ]
}

const curveLusd3CrvPayload: StrategyPayload = {
  name: 'Curve Lusd3Crv',
  lpToken: currentTokenData.LUSD3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.LUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData['3Crv']
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.LUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

const curveSUSDPayload: StrategyPayload = {
  name: 'Curve sUSD',
  lpToken: currentTokenData.crvPlain3andSUSD,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.sUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.crvPlain3andSUSD
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.sUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

const curveGusd3CrvPayload: StrategyPayload = {
  name: 'Curve Gusd3Crv',
  lpToken: currentTokenData.gusd3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.GUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.gusd3CRV
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.GUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

const convexStETHCrvPayload: StrategyPayload = {
  name: 'Convex stETHCrv',
  lpToken: currentTokenData.stkcvxsteCRV,

  unleveragableCollateral: [
    currentTokenData.WBTC,
    currentTokenData.USDC,
    currentTokenData.DAI
  ],
  leveragableCollateral: [
    currentTokenData.STETH,
    currentTokenData.WETH,
    currentTokenData.stkcvxsteCRV
  ],

  pools: [currentTokenData.WETH],
  baseAssets: [currentTokenData.WETH, currentTokenData.STETH]
}

const convexFrax3CrvPayload: StrategyPayload = {
  name: 'Convex Frax3Crv',
  lpToken: currentTokenData.stkcvxFRAX3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI,
    currentTokenData.FRAX3CRV
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.FRAX,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI
  ]
}

const convex3CrvPayload: StrategyPayload = {
  name: 'Convex 3Crv',
  lpToken: currentTokenData.stkcvx3Crv,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData['3Crv']
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.DAI
  ]
}

const convexLusd3CrvPayload: StrategyPayload = {
  name: 'Convex Lusd3Crv',
  lpToken: currentTokenData.stkcvxLUSD3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.LUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData['3Crv']
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.LUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

const convexCurveSUSDPayload: StrategyPayload = {
  name: 'Convex Curve-sUSD',
  lpToken: currentTokenData.stkcvxcrvPlain3andSUSD,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.sUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.crvPlain3andSUSD
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.sUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

const convexGusd3CrvPayload: StrategyPayload = {
  name: 'Convex Gusd3Crv',
  lpToken: currentTokenData.stkcvxgusd3CRV,

  unleveragableCollateral: [currentTokenData.WBTC, currentTokenData.WETH],
  leveragableCollateral: [
    currentTokenData.GUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT,
    currentTokenData.gusd3CRV
  ],

  pools: [currentTokenData.USDC, currentTokenData.DAI],
  baseAssets: [
    currentTokenData.GUSD,
    currentTokenData.DAI,
    currentTokenData.USDC,
    currentTokenData.USDT
  ]
}

export const strategiesPayload = [
  convexStETHCrvPayload,
  convexFrax3CrvPayload,
  convexLusd3CrvPayload,
  yearnStETHCrvPayload,
  yearnUSDCPayload,
  lidoStETHPayload,

  yearnDAIPayload,
  yearnWETHPayload,
  yearnWBTCPayload,
  yearnFrax3CrvPayload,
  curveStETHCrvPayload,
  curveFrax3CrvPayload,
  curve3CrvPayload,
  curveLusd3CrvPayload,
  curveSUSDPayload,
  curveGusd3CrvPayload,
  convex3CrvPayload,
  convexCurveSUSDPayload,
  convexGusd3CrvPayload
]

export const DEFAULT_STRATEGIES = strategiesPayload.reduce<
  Record<string, Strategy>
>((acc, p) => {
  acc[p.lpToken] = new Strategy(p)
  return acc
}, {})
