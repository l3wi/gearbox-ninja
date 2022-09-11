import { ethers } from 'ethers'
import { updateStatus } from '../operations'
import {
  callRepeater,
  CreditManagerData,
  CreditManagerDataPayload,
  IAddressProvider__factory,
  ICreditManager__factory,
  IDataCompressor,
  IDataCompressor__factory,
  IPathFinder__factory,
  IPoolService__factory,
  IWETHGateway__factory,
  MultiCallContract,
  PoolData,
  PoolDataPayload
} from '@gearbox-protocol/sdk'
import { providers } from 'ethers'

import { Wallets } from '../../config/connectors'
import {
  ADDRESS_PROVIDER,
  CHAIN_ID,
  JSON_RPC_PROVIDER,
  PATHFINDER
} from '../../config'
import { captureException } from '../../utils/errors'

import actions from '../actions'
import {
  clearCreditAccounts,
  deleteByCreditManager,
  getByCreditManager,
  getList as caGetList
} from '../creditAccounts/actions'
import { getList as cmGetList } from '../creditManagers/actions'
import { getList as poolGetList } from '../pools/actions'
import { updateCreditManagerEvents, updatePoolEvents } from '../sync/actions'
import { clearBalancesAllowances } from '../tokens/actions'
import { ThunkWeb3Action, Web3Actions } from './index'
import { removeTransactionFromList, restoreTransactions } from './transactions'

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

type PossibleProviders = providers.JsonRpcProvider | providers.Web3Provider

export const updateProvider =
  (provider: PossibleProviders): ThunkWeb3Action =>
  async (dispatch) => {
    try {
      const addressProviderMultiCall = new MultiCallContract(
        ADDRESS_PROVIDER,
        IAddressProvider__factory.createInterface(),
        provider
      )

      const [
        dataCompressorAddress,
        wethGateWayAddress,
        gearTokenAddress,
        wethTokenAddress
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
      )

      const wethGateway = IWETHGateway__factory.connect(
        wethGateWayAddress,
        provider
      )

      dispatch({
        type: 'PROVIDER_CONNECTED',
        payload: {
          provider,
          dataCompressor,
          gearTokenAddress,
          wethGateway,
          wethTokenAddress,
          pathFinder: IPathFinder__factory.connect(PATHFINDER, provider)
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

interface ConnectSignerProps {
  library: providers.Web3Provider
  dataCompressor: IDataCompressor
  chainId?: number
}

export const connectSigner =
  ({
    library,
    dataCompressor,
    chainId = CHAIN_ID
  }: ConnectSignerProps): ThunkWeb3Action =>
  async (dispatch, getState) => {
    try {
      const signer = library.getSigner().connectUnchecked()

      const account = await signer.getAddress()

      const addressProvider = IAddressProvider__factory.connect(
        ADDRESS_PROVIDER || '',
        signer.provider
      )

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

      const isListenersConnected = getState().web3.listeners[account]
      dispatch({ type: 'LISTENERS_ADDED', payload: account })

      pools.forEach((pl) => {
        if (!isListenersConnected) {
          const contract = IPoolService__factory.connect(pl.addr, signer)
          const pool = new PoolData(pl)
          dispatch(updatePoolEvents({ account, pool, contract }))

          const updatePools = (...args: any) => {
            dispatch(poolGetList())
            dispatch(updatePoolEvents({ account, pool, contract }))
            dispatch(cmGetList(signer))

            const { transactionHash: txHash } = args[args.length - 1] as {
              transactionHash: string
            }

            dispatch(
              removeTransactionFromList({
                account,
                txHash,
                chainId
              })
            )
          }

          contract.on(contract.filters.AddLiquidity(), updatePools)
          contract.on(contract.filters.RemoveLiquidity(), updatePools)
          contract.on(contract.filters.Borrow(), updatePools)
          contract.on(contract.filters.Repay(), updatePools)
        }
      })

      creditManagers.forEach((cm) => {
        if (!isListenersConnected) {
          const contract = ICreditManager__factory.connect(cm.addr, signer)

          const creditManager = new CreditManagerData(cm)

          dispatch(
            updateCreditManagerEvents({ account, creditManager, contract })
          )

          const updateCreditManagers = (...args: any) => {
            const { transactionHash: txHash } = args[args.length - 1] as {
              transactionHash: string
            }
            dispatch(
              removeTransactionFromList({
                account,
                txHash,
                chainId
              })
            )

            dispatch(caGetList())

            dispatch(
              updateCreditManagerEvents({ account, creditManager, contract })
            )
          }

          contract.on(
            contract.filters.OpenCreditAccount(null, account),
            updateCreditManagers
          )

          contract.on(
            contract.filters.CloseCreditAccount(account),
            updateCreditManagers
          )

          contract.on(
            contract.filters.RepayCreditAccount(account),
            updateCreditManagers
          )

          contract.on(contract.filters.LiquidateCreditAccount(account), () => {
            updateCreditManagers()
            dispatch(deleteByCreditManager(creditManager.address))

            dispatch(
              updateCreditManagerEvents({ account, creditManager, contract })
            )
          })
          contract.on(
            contract.filters.AddCollateral(account),
            updateCreditManagers
          )
          contract.on(
            contract.filters.IncreaseBorrowedAmount(account),
            updateCreditManagers
          )
          contract.on(contract.filters.ExecuteOrder(account), () => {
            dispatch(getByCreditManager(creditManager.address, account))
          })
        }
      })

      dispatch(actions.pools.getList())
      dispatch(restoreTransactions({ account, chainId, provider: library }))
      dispatch(actions.game.AddNotification('wallet connected', 3000))
    } catch (e: any) {
      dispatch(disconnectSigner())
      console.error('store/web3/actions' + 'Cant connectSigner' + e)
      dispatch({ type: 'WEB3_FAILED', payload: { error: 'CONNECTION_ERROR' } })
    }
  }

export function disconnectSigner(): ThunkWeb3Action {
  return async (dispatch) => {
    try {
      dispatch(clearCreditAccounts())
      dispatch(clearBalancesAllowances())
      dispatch({ type: 'WEB3_RESET' })
    } catch (e: any) {
      captureException('store/web3/actions', 'Cant disconnectSigner', e)
    }
  }
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
  (opHash = '0'): ThunkWeb3Action =>
  async (dispatch, getState) => {
    try {
      const { provider, account } = getState().web3
      if (!provider || !account) {
        throw new Error('Cant get 23b instance')
      }
      const balance = await provider.getBalance(account)

      dispatch({ type: 'WEB3_BALANCE_SUCCESS', payload: balance })
      updateStatus(opHash, 'STATUS.SUCCESS')
    } catch (e: any) {
      updateStatus(opHash, 'STATUS.FAILURE', e)
      console.error('store/web3/actions', 'Cant getEthBalance', e)
    }
  }
