import { BigNumber } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

import { CHAIN_ID } from '../config'

import { store } from '../store'
import actions from '../store/actions'

import { Wallets, walletsToConnectors } from '../config/connectors'
import { Web3 } from '../config/web3'

type EthProvider = {
  isCoinbaseWallet?: boolean
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true
      isCoinbaseWallet?: true
      on: (...args: Array<any>) => void
      once: (...args: Array<any>) => void
      enable: () => Promise<any>
      removeListener: (...args: Array<any>) => void
      request: (arg: { method: string; params?: Array<any> }) => Promise<any>
      autoRefreshOnNetworkChange: boolean
      networkVersion: string
      providers: Array<EthProvider>
      setSelectedProvider: (provider: any) => void
    }
    web3?: Record<string, unknown>
  }
}

// export let web3 = store.getState()

// Merges functionality from useSync, useWeb3 & web3-react to manage Metamask & WC

// Connect web3 READ ONLY
export const connect = async () => {
  store.dispatch(actions.web3.connectProvider())
}

// Connect Signer
// 1. Figure out which connector
// 2. create
export const activate = async (w: Wallets) => {
  const isInjectedWallet = w === 'metamask' // removed coinbase

  let connector
  if (isInjectedWallet) {
    // MM uses propmts prior to provider setup
    await window.ethereum.enable()
    connector = walletsToConnectors[w]
  } else {
    // WC uses propmts post to provider setup
    connector = walletsToConnectors[w]
    //@ts-ignore
    await connector.enable() // need to extend Web#Provider interface
  }

  try {
    store.dispatch(actions.web3.connectSigner(connector))

    if (window.ethereum && isInjectedWallet) {
      window.ethereum.on('chainChanged', () => {
        ;(window.ethereum as any).removeAllListeners('chainChanged')
      })

      store.dispatch(actions.web3.disconnectSigner())
      window.ethereum.on('accountsChanged', async () => {
        ;(window.ethereum as any).removeAllListeners('chainChanged')
        store.dispatch(actions.web3.setWalletType(w))
      })
    }

    // Set Wallet trype
    store.dispatch(actions.web3.setWalletType(w))
  } catch (eo: any) {
    if (window.ethereum && isInjectedWallet) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }]
        })

        if (w === 'metamask') {
          window.ethereum.once('chainChanged', async () => {
            await activate(w)
          })
        }
      } catch (e: any) {
        alert('Cant useWeb3' + e)
        // e.code === 4902 - chain not added
        // e.code === -32002 - request already pending
      }
    }

    store.dispatch(actions.web3.setWalletType(undefined))
    alert('Cant Web3' + eo)
  }
}

export const deactivate = async () => {
  store.dispatch(actions.web3.disconnectSigner())
  store.dispatch(actions.web3.setWalletType(undefined))
}

export default { activate, deactivate }
