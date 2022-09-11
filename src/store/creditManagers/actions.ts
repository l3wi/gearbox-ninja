import {
  Asset,
  callRepeater,
  CreditManagerData,
  CreditManagerDataPayload,
  ICreditFacade__factory,
  NetworkError,
  TxAddCollateral,
  TxIncreaseBorrowAmount,
  TxOpenMultitokenAccount,
  TxRepayAccount
} from '@gearbox-protocol/sdk'
import { updateStatus } from '../operations'
import { BigNumber, ethers, Signer } from 'ethers'

import { CHAIN_ID, PATHFINDER } from '../../config'
import { AdapterManager } from '../../config/adapterManager'
import { TradePath } from '../../config/closeTradePath'
import { connectorTokenAddresses } from '../../config/tokens/tokenLists'
import { captureException } from '../../utils/errors'
import {
  deleteByCreditManager,
  deleteInProgressByCreditManager,
  getByCreditManager,
  getList as caGetList,
  openInProgressByCreditManager,
  removeOpenInProgressByCreditManager
} from '../creditAccounts/actions'
import { getError } from '../operations'
import { getTokenBalances } from '../tokens/actions'
import { getSignerOrThrow } from '../web3'
import { addPendingTransaction } from '../web3/transactions'
import { CreditManagerThunkAction, getCreditManagerOrThrow } from '.'

export const getList =
  (provider: Signer | ethers.providers.Provider): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      const { dataCompressor, wethTokenAddress } = getState().web3
      if (!dataCompressor) throw new Error('dataCompressor is undefined')

      const creditManagersPayload: Array<CreditManagerDataPayload> =
        await callRepeater(() => dataCompressor.getCreditManagersList())

      const creditManagers = creditManagersPayload.reduce<
        Record<string, CreditManagerData>
      >((acc, payload) => {
        acc[payload.addr.toLowerCase()] = new CreditManagerData(payload)
        return acc
      }, {})

      const adaptersRes = await Promise.all(
        creditManagersPayload.map((payload) =>
          Signer.isSigner(provider)
            ? AdapterManager.connectAdapterManager({
                creditManager: creditManagers[payload.addr.toLowerCase()],
                pathFinder: PATHFINDER,
                signer: provider,
                wethToken: wethTokenAddress!,
                connectors: connectorTokenAddresses
              })
            : null
        )
      )

      const adapterManagers = adaptersRes.reduce<
        Record<string, AdapterManager>
      >((acc, am) => {
        if (am !== null) acc[am.creditManager.address] = am

        return acc
      }, {})

      dispatch({
        type: 'CREDIT_MANAGERS_SUCCESS',
        payload: { creditManagers, adapterManagers }
      })
    } catch (e: any) {
      dispatch({ type: 'CREDIT_MANAGERS_ERROR', payload: new NetworkError() })
      captureException('store/creditManagers/actions', 'CM: cant getList cm', e)
    }
  }

export interface OpenCreditAccountMultiTokenProps {
  creditManager: CreditManagerData
  borrowedAmount: BigNumber
  wrappedAssets: Array<Asset>
  ethAmount: BigNumber
  opHash: string
  chainId?: number
}

export const openCreditAccountMultiToken =
  ({
    creditManager,
    borrowedAmount,
    wrappedAssets,
    ethAmount,
    opHash = '0',
    chainId = CHAIN_ID
  }: OpenCreditAccountMultiTokenProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))

      const signer = getSignerOrThrow(getState)
      const {
        creditFacade: creditFacadeAddress,
        address: creditManagerAddress,
        underlyingToken
      } = creditManager
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer
      )
      const account = await signer.getAddress()

      const calls = wrappedAssets.map(
        ({ token: tokenAddress, balance: amount }) =>
          creditManager.encodeAddCollateral(account, tokenAddress, amount)
      )

      const receipt = await creditFacade.openCreditAccountMulticall(
        borrowedAmount,
        account,
        calls,
        0,
        { value: ethAmount }
      )

      dispatch(openInProgressByCreditManager(creditManagerAddress))

      const evmTx = new TxOpenMultitokenAccount({
        txHash: receipt.hash,
        creditManager: creditManagerAddress,
        timestamp: receipt.timestamp || 0,
        borrowedAmount,
        underlyingToken,
        assets: wrappedAssets.map(({ token }) => token)
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getByCreditManager(creditManagerAddress, account))

            dispatch(caGetList())
            dispatch(removeOpenInProgressByCreditManager(creditManagerAddress))
            dispatch(getTokenBalances({ account }))
            dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))
          }
        })
      )
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException(
        'store/creditManagers/actions',
        'Cant openCreditAccountMultiToken',
        creditManager.address,
        wrappedAssets.map(({ token }) => token).toString(),
        e
      )
    }
  }

interface RepayAccountProps {
  creditManager: string
  isEth: boolean
  opHash: string
  chainId?: number
}

export const repayAccount =
  ({
    creditManager,
    isEth,
    opHash = '0',
    chainId = CHAIN_ID
  }: RepayAccountProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))
      const signer = getSignerOrThrow(getState)
      const cm = getCreditManagerOrThrow(getState, creditManager)
      getSignerOrThrow(getState)

      if (isEth) {
        return
        /*
        !& no repayCreditAccountETH at WETHGateway
        const wethGateway = getWETHGatewayOrThrow(getState);
        const signerAddress = await signer.getAddress();
        const repayAmount = await cm
          .getContractETH(signer)
          .calcRepayAmount(signerAddress, false);
        receipt = await wethGateway
          .connect(signer)
          .repayCreditAccountETH(creditManager, signerAddress, {
            value: repayAmount.mul(REPAY_SURPLUS).div(PERCENTAGE_FACTOR) // We send 101% to cover possible growing interest rate with tx will be submitted
          });
        */
      }
      const receipt = await cm
        .getContractETH(signer)
        .repayCreditAccount(await signer.getAddress())

      dispatch(deleteInProgressByCreditManager(creditManager))

      const evmTx = new TxRepayAccount({
        txHash: receipt.hash,
        creditManager,
        timestamp: 0
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(deleteByCreditManager(creditManager))
          }
        })
      )

      dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException(
        'store/creditManagers/actions',
        'Cant repayAccount',
        creditManager,
        e
      )
    }
  }

interface CloseCreditAccountProps {
  creditManager: string
  paths: Array<TradePath>
  opHash: string
  chainId?: number
}

export const closeCreditAccount =
  ({
    creditManager,
    paths,
    opHash = '0',
    chainId = CHAIN_ID
  }: CloseCreditAccountProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    // try {
    //   dispatch(updateStatus(opHash, "STATUS.WAITING"));
    //   const signer = getSignerOrThrow(getState);
    //   const cm = getCreditManagerOrThrow(getState, creditManager);
    //   const gasLimit = await cm
    //     .getContractETH(signer)
    //     .estimateGas.closeCreditAccount(await signer.getAddress(), paths);
    //   const receipt = await cm
    //     .getContractETH(signer)
    //     .closeCreditAccount(await signer.getAddress(), paths, {
    //       gasLimit: gasLimit.mul(12).div(10),
    //     });
    //   dispatch(deleteInProgressByCreditManager(creditManager));
    //   const evmTx = new TxCloseAccount({
    //     txHash: receipt.hash,
    //     creditManager,
    //     timestamp: 0,
    //   });
    //   dispatch(
    //     addPendingTransaction({
    //       chainId,
    //       tx: evmTx,
    //       callback: () => dispatch(deleteByCreditManager(creditManager)),
    //     }),
    //   );
    //   dispatch(updateStatus(opHash, "STATUS.SUCCESS"));
    // } catch (e: any) {
    //   dispatch(updateStatus(opHash, "STATUS.FAILURE", getError(e)));
    //   captureException(
    //     "store/creditManagers/actions",
    //     "Cant closeCreditAccount",
    //     creditManager,
    //     e,
    //   );
    // }
  }

interface IncreaseBorrowProps {
  creditManager: CreditManagerData
  amount: BigNumber
  opHash: string
  chainId?: number
}

export const increaseBorrow =
  ({
    creditManager,
    amount,
    opHash = '0',
    chainId = CHAIN_ID
  }: IncreaseBorrowProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))

      const signer = getSignerOrThrow(getState)
      const { creditFacade: creditFacadeAddress, underlyingToken } =
        creditManager
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer
      )
      const account = await signer.getAddress()

      const receipt = await creditFacade.increaseDebt(amount)

      const evmTx = new TxIncreaseBorrowAmount({
        txHash: receipt.hash,
        amount,
        creditManager: creditManager.address,
        underlyingToken,
        timestamp: 0
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () =>
            dispatch(getByCreditManager(creditManager.address, account))
        })
      )

      dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException(
        'store/creditManagers/actions',
        'Cant increaseBorrow',
        creditManager.address,
        amount.toString(),
        e
      )
    }
  }

export const decreaseBorrow =
  ({
    creditManager,
    amount,
    opHash = '0',
    chainId = CHAIN_ID
  }: IncreaseBorrowProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))

      const signer = getSignerOrThrow(getState)
      const { creditFacade: creditFacadeAddress, underlyingToken } =
        creditManager
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer
      )
      const account = await signer.getAddress()

      const receipt = await creditFacade.decreaseDebt(amount)

      const evmTx = new TxIncreaseBorrowAmount({
        txHash: receipt.hash,
        amount,
        creditManager: creditManager.address,
        underlyingToken,
        timestamp: 0
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getByCreditManager(creditManager.address, account))
            dispatch(getTokenBalances({ account }))
          }
        })
      )

      dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException(
        'store/creditManagers/actions',
        'Cant decreaseBorrow',
        creditManager.address,
        amount.toString(),
        e
      )
    }
  }

interface AddCollateralProps {
  creditManager: CreditManagerData
  asset: Asset
  ethAmount: BigNumber
  opHash: string
  chainId?: number
}

export const addCollateral =
  ({
    creditManager,
    asset,
    ethAmount,
    opHash = '0',
    chainId = CHAIN_ID
  }: AddCollateralProps): CreditManagerThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, 'STATUS.WAITING'))
      const { token: tokenAddress, balance: amount } = asset

      const signer = getSignerOrThrow(getState)
      const { creditFacade: creditFacadeAddress } = creditManager
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer
      )
      const account = await signer.getAddress()

      const receipt = await creditFacade.addCollateral(
        account,
        tokenAddress,
        amount,
        { value: ethAmount }
      )

      dispatch(updateStatus(opHash, 'STATUS.SUCCESS'))

      const evmTx = new TxAddCollateral({
        txHash: receipt.hash,
        amount,
        creditManager: creditManager.address,
        addedToken: tokenAddress,
        timestamp: 0
      })

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getByCreditManager(creditManager.address, account))
            dispatch(getTokenBalances({ account }))
          }
        })
      )
    } catch (e: any) {
      dispatch(updateStatus(opHash, 'STATUS.FAILURE', getError(e)))
      captureException(
        'store/creditManagers/actions',
        'Cant addCollateral',
        creditManager.address,
        e
      )
    }
  }
