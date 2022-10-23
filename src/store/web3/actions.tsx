import { BigNumber, ContractTransaction, ethers } from 'ethers'
import { updateStatus } from '../operations'
import {
  callRepeater,
  CreditManagerData,
  CreditManagerDataPayload,
  IAddressProvider__factory,
  ICreditManager__factory,
  IDataCompressor,
  IDataCompressor__factory,
  IPoolService__factory,
  IWETHGateway__factory,
  MultiCallContract,
  PoolData,
  PoolDataPayload,
  PathFinder,
  IwstETHGateWay__factory,
  stEthPoolWrapper,
  IDegenNFT__factory,
  IDegenDistributor__factory,
  IERC721Metadata__factory
} from '@gearbox-protocol/sdk'
import { providers } from 'ethers'

import { Wallets } from '../../config/connectors'
import {
  ADDRESS_PROVIDER,
  CHAIN_ID,
  JSON_RPC_PROVIDER,
  CHAIN_TYPE,
  DEGEN_DISTRIBUTOR,
  DEGEN_NFT
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
import { getSignerOrThrow, ThunkWeb3Action, Web3Actions } from './index'
import { removeTransactionFromList, restoreTransactions } from './transactions'
import { game } from 'melonjs'

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
        wethTokenAddress,
        pathfinder
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
          },
          {
            method: 'getLeveragedActions()'
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
          pathFinder: new PathFinder(pathfinder, provider, CHAIN_TYPE)
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

      const wstethGateway = IwstETHGateWay__factory.connect(
        stEthPoolWrapper[CHAIN_TYPE],
        signer
      )

      dispatch({
        type: 'WEB3_CONNECTED',
        payload: {
          account,
          signer,
          wethGateway,
          wstethGateway
        }
      })

      dispatch(actions.tokens.getTokenBalances({ account }))

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

      dispatch(actions.game.PauseGame('Wallet Connected'))

      dispatch(actions.pools.getList())
      dispatch(actions.creditAccounts.getList())
      dispatch(actions.creditManagers.getList(signer.provider))
      dispatch(isNFTClaimed())
      dispatch(currentNFTBalance())

      dispatch(restoreTransactions({ account, chainId, provider: library }))
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

interface MerkleDistributorInfo {
  merkleRoot: string
  tokenTotal: string
  claims: {
    [account: string]: {
      index: number
      amount: string
      proof: ethers.utils.BytesLike[]
    }
  }
}

export const currentNFTBalance =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    import('../../config/merkle.json').then(
      async (merkle: MerkleDistributorInfo) => {
        try {
          const { claims } = merkle
          const signer = getSignerOrThrow(getState)
          const signerAddress = await signer.getAddress()

          if (!claims[signerAddress])
            return dispatch({ type: 'NFT_BALANCE_SUCCESS', payload: 0 })

          const nftDistributor = IERC721Metadata__factory.connect(
            DEGEN_NFT,
            signer
          )

          const amount = await nftDistributor.balanceOf(signerAddress)
          dispatch({ type: 'NFT_BALANCE_SUCCESS', payload: amount.toNumber() })
        } catch (e) {
          console.error('store/web3/actions', 'Cant check if NFT is claimed', e)
        }
      }
    )
  }

export const isNFTClaimed =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    import('../../config/merkle.json').then(
      async (merkle: MerkleDistributorInfo) => {
        try {
          const { claims } = merkle
          const signer = getSignerOrThrow(getState)
          const signerAddress = await signer.getAddress()

          if (!claims[signerAddress])
            return dispatch({ type: 'NO_NFT_WHITELIST' })

          const nftDistributor = IDegenDistributor__factory.connect(
            DEGEN_DISTRIBUTOR,
            signer
          )

          const { index, amount } = claims[signerAddress]
          const claimed = await nftDistributor.isClaimed(index)

          if (claimed) game.world.getChildByName('bridge')[0].setOpacity(1)
          dispatch({ type: 'NFT_CLAIMED_SUCCESS', payload: claimed })
          dispatch({ type: 'NFT_CLAIMABLE_BALANCE', payload: parseInt(amount) })
        } catch (e) {
          console.error('store/web3/actions', 'Cant check if NFT is claimed', e)
        }
      }
    )
  }

export const mintNFT = (): ThunkWeb3Action => async (dispatch, getState) => {
  import('../../config/merkle.json').then(
    async (merkle: MerkleDistributorInfo) => {
      try {
        const signer = getSignerOrThrow(getState)
        const signerAddress = await signer.getAddress()

        const nftDistributor = IDegenDistributor__factory.connect(
          DEGEN_DISTRIBUTOR,
          signer
        )
        updateStatus('0', 'STATUS.WAITING')
        dispatch(actions.game.AddNotification('Waiting for user'))

        const { index, amount, proof } = merkle.claims[signerAddress]
        const receipt = await nftDistributor.claim(
          index,
          signerAddress,
          amount,
          proof
        )

        updateStatus('0', 'STATUS.LOADING')
        const amnt = BigNumber.from(amount).toNumber()
        dispatch(actions.game.AddNotification(`Minting ${amnt}x NFTs`, 0))
        await receipt.wait()

        dispatch(actions.game.AddNotification('Mint successful!'))
        updateStatus('0', 'STATUS.SUCCESS')
        return true
      } catch (e) {
        updateStatus('0', 'STATUS.FAILURE', e)
        console.error('store/web3/actions', 'Cant  mintNFT', e)
        return false
      }
    }
  )
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
