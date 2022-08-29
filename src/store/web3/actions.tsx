import { ethers } from 'ethers'
// import { updateStatus } from 'dlt-operations'
import {
  IAddressProvider__factory,
  IDataCompressor__factory,
  IWETHGateway__factory,
  PathFinder__factory
} from '@gearbox-protocol/sdk/lib/types'
import {
  ADDRESS_0x0,
  AddressProvider,
  callRepeater,
  CreditManagerData,
  CreditManagerDataPayload,
  DataCompressor,
  ICreditManager__factory,
  IPoolService__factory,
  KOVAN_NETWORK,
  MultiCallContract,
  PoolData,
  PoolDataPayload,
  TxSerializer
} from '@gearbox-protocol/sdk'
// import { toast } from "react-toastify";
import { Web3Provider } from '@ethersproject/providers'
import { EVMTx } from '@gearbox-protocol/sdk/lib/core/eventOrTx'

import { Wallets } from '../../config/connectors'
import {
  ADDRESS_PROVIDER,
  BLOCK_UPDATE_DELAY,
  CHAIN_ID,
  JSON_RPC_PROVIDER,
  PATHFINDER
} from '../../config'
// import { batchLoadTokenData, clearBalancesAllowances } from '../tokens/actions'

import actions from '../actions'
// import { setTokenList } from '../price/actions'
// import { clearCreditAccounts } from '../creditAccounts/actions'
import { updateLastBlock } from '../sync/actions'
import { ThunkWeb3Action, Web3Actions } from './index'

export const connectProvider =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER)
      dispatch(updateProvider(provider))
    } catch (e: any) {
      console.error(
        'store/web3/actions' +
          'Cant connectProvider' +
          `${JSON_RPC_PROVIDER}` +
          e
      )
    }
  }

export const updateProvider =
  (
    provider:
      | ethers.providers.JsonRpcProvider
      | Promise<ethers.providers.Web3Provider>
  ): ThunkWeb3Action =>
  async (dispatch, getState) => {
    try {
      provider = await provider
      const network = await provider.detectNetwork()

      if (network.chainId !== CHAIN_ID) {
        dispatch(actions.web3.disconnectSigner())
        dispatch(actions.web3.setWalletType(undefined))
        throw new Error('Incorrect network')
      }

      const addressProviderMultiCall = new MultiCallContract(
        ADDRESS_PROVIDER,
        IAddressProvider__factory.createInterface(),
        provider
      )

      const [
        dataCompressorAddress,
        wethGateWayAddress,
        gearTokenAddress,
        wethTokenAddress,
        leveragedActions
      ] = await callRepeater(() =>
        addressProviderMultiCall.call([
          {
            method: 'getDataCompressor()'
          },
          {
            method: 'getWETHGateway()'
          },
          {
            method: 'getGearToken()'
          },
          {
            method: 'getWethToken()'
          }
        ])
      )

      const dataCompressor = IDataCompressor__factory.connect(
        dataCompressorAddress,
        provider
      ) as DataCompressor

      const wethGateway = IWETHGateway__factory.connect(
        wethGateWayAddress,
        provider
      )

      let etherscan = 'https://etherscan.io'

      switch (network.chainId) {
        case KOVAN_NETWORK:
          etherscan = 'https://kovan.etherscan.io'
      }

      dispatch({
        type: 'PROVIDER_CONNECTED',
        payload: {
          provider,
          dataCompressor,
          gearTokenAddress,
          wethGateway,
          wethTokenAddress,
          leveragedActions,
          chainId: network.chainId,
          pathFinder: PathFinder__factory.connect(PATHFINDER, provider),
          etherscan
        }
      })
    } catch (e: any) {
      console.error('store/web3/actions' + 'Cant updateProvider' + e)
    }
  }

export const setWalletType = (w: Wallets | undefined): Web3Actions => ({
  type: 'WALLET_SET',
  payload: w
})

export const connectSigner =
  (library: Web3Provider): ThunkWeb3Action =>
  async (dispatch, getState) => {
    try {
      const network = await library.detectNetwork()

      if (network.chainId !== CHAIN_ID) {
        dispatch(actions.web3.disconnectSigner())
        dispatch(actions.web3.setWalletType(undefined))

        // Notify user
        dispatch(
          actions.game.AddNotification(
            `wrong network: switch to ${CHAIN_ID === 42 ? 'kovan' : 'mainnet'}`,
            3000
          )
        )
        throw new Error('Incorrect network')
      }

      const signer = library.getSigner().connectUnchecked()

      const account = await signer.getAddress()

      const addressProvider = IAddressProvider__factory.connect(
        ADDRESS_PROVIDER || '',
        signer.provider
      ) as AddressProvider

      const wethGateWayAddress = await addressProvider.getWETHGateway()

      const wethGateway = IWETHGateway__factory.connect(
        wethGateWayAddress,
        signer
      )

      dispatch({
        type: 'WEB3_CONNECTED',
        payload: {
          account,
          signer,
          wethGateway
        }
      })

      dispatch({ type: 'LISTENERS_ADDED', payload: account })

      const { dataCompressor } = getState().web3

      if (!dataCompressor) {
        throw new Error('datacompressor is undefined')
      }

      const dataCompressorMultiCall = new MultiCallContract(
        dataCompressor.address,
        dataCompressor.interface,
        signer.provider
      )

      const [pools, creditManagers] = await callRepeater(() =>
        dataCompressorMultiCall.call<
          [Array<PoolDataPayload>, Array<CreditManagerDataPayload>]
        >([
          {
            method: 'getPoolsList()'
          },
          {
            method: 'getCreditManagersList()'
          }
        ])
      )

      dispatch(updateLastBlock(signer.provider))

      const isListenersConnected = getState().web3.listeners[account]
      pools.forEach((pl) => {
        if (!isListenersConnected) {
          const contract = IPoolService__factory.connect(pl.addr, signer)
          const pool = new PoolData(pl)
          dispatch(actions.sync.updatePoolEvents(account, pool, contract))

          const updatePools = (...args: any) => {
            dispatch(actions.pools.getList())
            dispatch(actions.sync.updatePoolEvents(account, pool, contract))
            // dispatch(actions.creditManagers.getList(signer))

            const { transactionHash } = args[args.length - 1] as {
              transactionHash: string
            }

            dispatch(removeTransactionFromList(account, transactionHash))
          }

          contract.on(contract.filters.AddLiquidity(), updatePools)
          contract.on(contract.filters.RemoveLiquidity(), updatePools)
          contract.on(contract.filters.Borrow(), updatePools)
          contract.on(contract.filters.Repay(), updatePools)
        }
      })

      dispatch(actions.pools.getList())
      dispatch(toggleSync())
      dispatch(restoreTransactions(account))
      dispatch(actions.game.AddNotification('wallet connected', 3000))
    } catch (e: any) {
      dispatch(disconnectSigner())
      console.error('store/web3/actions' + 'Cant connectSigner' + e)
      dispatch({ type: 'WEB3_FAILED', payload: { error: 'CONNECTION_ERROR' } })
    }
  }

export const disconnectSigner =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    const { provider } = getState().web3
    dispatch(connectProvider())

    dispatch({ type: 'WEB3_RESET' })
  }

export const signDeclaration =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    try {
      const { account, signer } = getState().web3
      if (!account || !signer) throw new Error('No account selected')

      const agreement =
        'I hereby further represent and warrant that:\n' +
        '- I’m not a resident of or located in the United States of America (including its territories: American Samoa, Guam, Puerto Rico, the Northern Mariana Islands and the U.S. Virgin Islands) or any other Restricted Jurisdiction (as defined in the Terms of Service).\n' +
        '- I’m not a Prohibited Person (as defined in the Terms of Service) nor acting on behalf of a Prohibited Person.\n' +
        '- I understand that if I fail to maintain sufficient collateral when using the Gearbox Protocol, my credit account(s) may be liquidated, in which case a penalty may be charged by the protocol.\n' +
        '- I acknowledge that Gearbox App and related software are experimental, and that the use of experimental software may result in complete loss of my funds.'

      // @ts-ignore
      const signature = await signer.signMessage(agreement)
      dispatch(actions.game.AddNotification('Signed Declaration'))

      dispatch({
        type: 'SIGNED_MESSAGE',
        payload: { notIllegal: true }
      })
    } catch (e: any) {
      dispatch(actions.game.AddNotification('Signature Error'))
      dispatch({
        type: 'SIGNED_MESSAGE',
        payload: { notIllegal: false, signRejected: true }
      })
      console.error('Cant signup: ' + e)
    }
  }

export const getEthBalance =
  (opHash: string = '0'): ThunkWeb3Action =>
  async (dispatch, getState) => {
    try {
      const { provider, account } = getState().web3
      if (!provider || !account) {
        throw new Error('Cant get 23b instance')
      }
      const balance = await provider.getBalance(account)

      dispatch({ type: 'WEB3_BALANCE_SUCCESS', payload: balance })
      // dispatch(updateStatus(opHash, 'STATUS.SUCCESS')
    } catch (e: any) {
      // updateStatus(opHash, 'STATUS.FAILURE', e)
      console.error('store/web3/actions' + 'Cant getEthBalance' + e)
    }
  }

export const addPendingTransaction =
  (tx: EVMTx, callback: () => void): ThunkWeb3Action =>
  async (dispatch, getState) => {
    const { provider, account, transactions, chainId, etherscan } =
      getState().web3

    if (!provider || !account) throw new Error('Prov is empty')

    const txForSaving = [...(transactions[account] || []), tx]

    dispatch({
      type: 'UPSERT_PENDING_TX',
      payload: { account, tx }
    })

    localStorage.setItem(
      `txs_${chainId}_${account.toLowerCase()}`,
      TxSerializer.serialize(txForSaving)
    )

    const receipt = await provider.waitForTransaction(tx.txHash)
    callback()

    const txFromChain = await provider.getTransactionReceipt(
      receipt.transactionHash
    )

    const tokens = getState().tokens.details

    if (txFromChain.blockNumber) {
      if (txFromChain.logs.length > 0) {
        tx.success(txFromChain.blockNumber)
        // toast.success(tx.toString(tokens), {
        //   style: { background: '#111927', color: 'white' },
        //   onClick: () => openInNewWindow(`${etherscan}/tx/${tx.txHash}`),
        //   autoClose: 7500
        // })
      } else {
        tx.revert(txFromChain.blockNumber)
        // toast.error(tx.toString(tokens), {
        //   style: { background: '#111927', color: 'white' },
        //   onClick: () => openInNewWindow(`${etherscan}/tx/${tx.txHash}`),
        //   autoClose: 12500
        // })
      }
      dispatch({
        type: 'UPSERT_PENDING_TX',
        payload: { account, tx }
      })
    }
  }

export const restoreTransactions =
  (account: string): ThunkWeb3Action =>
  async (dispatch, getState) => {
    const { provider, chainId } = getState().web3

    if (!provider) {
      console.error('Can get provider')
      return
    }

    const storedTxs = localStorage.getItem(
      `txs_${chainId}_${account.toLowerCase()}`
    )
    if (storedTxs !== null) {
      const txs = TxSerializer.deserialize(storedTxs)
      for (let tx of txs) {
        if (tx.isPending) {
          const txFromChain = await provider.getTransactionReceipt(tx.txHash)

          if (txFromChain) {
            if (txFromChain.logs.length > 0) {
              tx.success(txFromChain.blockNumber)
            } else {
              tx.revert(txFromChain.blockNumber)
            }
          } else {
            tx.revert(0)
          }
        }
      }

      dispatch({
        type: 'UPDATE_ALL_TX',
        payload: { account, txs }
      })
    }
  }

export const removeTransactionFromList =
  (account: string, txHash: string): ThunkWeb3Action =>
  async (dispatch, getState) => {
    const { transactions, chainId } = getState().web3

    const accTxs = transactions[account] || []
    const txs = accTxs.filter(
      (tx) => tx.txHash.toLowerCase() !== txHash.toLowerCase()
    )

    if (txs.length !== accTxs.length) {
      localStorage.setItem(
        `txs_${chainId}_${account.toLowerCase()}`,
        TxSerializer.serialize(txs)
      )
      dispatch({
        type: 'UPDATE_ALL_TX',
        payload: { account, txs }
      })
    }
  }

export const clearPendingTransactions =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    const { account } = getState().web3
    if (account)
      dispatch({ type: 'UPDATE_ALL_TX', payload: { account, txs: [] } })
  }

export const toggleSync = (): ThunkWeb3Action => async (dispatch, getState) => {
  const { signer, account } = getState().web3
  let updateTask: any
  if (signer?.provider) {
    const syncTask = () => {
      // @ts-ignore
      dispatch(updateLastBlock(signer.provider))
    }
    updateTask = setInterval(syncTask, BLOCK_UPDATE_DELAY)
  }

  return function syncCleanup() {
    clearInterval(updateTask)
  }
}
