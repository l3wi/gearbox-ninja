import { Web3Provider } from '@ethersproject/providers'
// import WalletConnectProvider from '@walletconnect/web3-provider'

import { CHAIN_ID, JSON_RPC_PROVIDER } from '../config'

const currentRpcString = JSON_RPC_PROVIDER as string

const activeRpcUrl = {
  [CHAIN_ID]: currentRpcString
}

export const injected = new Web3Provider(
  (window as any).ethereum, // Haaaaacky
  'any'
)

// Duplicate to keep TS happy
export const walletconnect = new Web3Provider(
  (window as any).ethereum // Haaaaacky
)

// export const walletconnect = new Web3Provider(
//   new WalletConnectProvider({ rpc: activeRpcUrl[CHAIN_ID] })
// )

export const walletsToConnectors = {
  metamask: injected,
  walletConnect: walletconnect
}

export type Wallets = keyof typeof walletsToConnectors
