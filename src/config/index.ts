import { tokenDataByNetwork } from '@gearbox-protocol/sdk'

export const isDev = process.env.NODE_ENV !== 'production'

export const CHART_ADDR = isDev
  ? 'http://localhost:3002'
  : process.env.REACT_APP_CHAIN_ID === '42'
  ? 'https://charts.kovan.gearbox.fi'
  : 'https://charts.gearbox.fi'

export const ETHERSCAN_ADDR =
  process.env.REACT_APP_CHAIN_ID === '42'
    ? 'https://kovan.etherscan.io'
    : 'https://etherscan.io'

export const DISCORD_ADDR = 'https://discord.com/invite/gearbox'

export const FAUCET_ADDR =
  process.env.REACT_APP_FAUCET_ADDR || 'https://faucet.gearbox-api.com'

export const TEST_APP_ADDR =
  process.env.REACT_APP_TEST_APP_ADDR || 'https://app.kovan.gearbox.fi'

export const LP_TOKENS = [
  tokenDataByNetwork.Mainnet.yvDAI,
  tokenDataByNetwork.Mainnet.yvUSDC,
  tokenDataByNetwork.Kovan.yvDAI,
  tokenDataByNetwork.Kovan.yvUSDC
]

export const isTestChief = process.env.REACT_APP_CHAIN_ID === '42'

export const AUTH_ADDR =
  process.env.REACT_APP_AUTH_ADDR || 'https://auth.gearbox-api.com'

export const PATHFINDER = process.env.REACT_APP_PATHFINDER || ''
export const REPAY_SURPLUS = 10003

export const getAuthUrl = (url: string) => `${AUTH_ADDR}${url}`

/// CONTRACTS
export const ADDRESS_PROVIDER = process.env.REACT_APP_ADDRESS_PROVIDER || ''
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || '42')

export const JSON_RPC_PROVIDER =
  process.env.REACT_APP_CHAIN_ID === '42'
    ? process.env.REACT_APP_JSON_RPC_KOVAN
    : process.env.REACT_APP_CHAIN_ID === '1'
    ? process.env.REACT_APP_JSON_RPC_MAINNET
    : process.env.REACT_APP_JSON_RPC_FORK

export const PRICE_DATA_EXPIRATION = 300 * 1000 // each 5 min

export const BLOCK_UPDATE_DELAY = 30000

export const multiCallConfig = {
  preset: CHAIN_ID === 42 ? 'kovan' : 'mainnet'
}

export const MULTICALL_ADDRESS = '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
