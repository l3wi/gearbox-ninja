import { Web3Provider } from '@ethersproject/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { CHAIN_ID, JSON_RPC_PROVIDER } from '../config'

// type AbstractConnector = NonNullable<
//   ReturnType<typeof Web3Provider>['connector']
// >

const currentRpcString = JSON_RPC_PROVIDER as string

const activeRpcUrl = {
  [CHAIN_ID]: currentRpcString
}

export const injected = new Web3Provider(
  (window as any).ethereum // Haaaaacky
)

export const walletconnect = new Web3Provider(
  new WalletConnectProvider({ rpc: activeRpcUrl[CHAIN_ID] })
)

// use "provider.enable()"" to trigger qr

export const walletsToConnectors = {
  metamask: injected,
  walletConnect: walletconnect
}

export type Wallets = keyof typeof walletsToConnectors

// export const walletByConnector = (
//   connector: AbstractConnector
// ): Wallets | null => {
//   switch (true) {
//     case connector instanceof Web3Provider:
//       return 'metamask'
//     case connector instanceof walletconnect:
//       return 'walletConnect'
//     default:
//       return null
//   }
// }
