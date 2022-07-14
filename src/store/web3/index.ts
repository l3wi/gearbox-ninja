import { RootState } from '../index'
import { BigNumberish, ethers, Signer } from 'ethers'
import { ThunkAction } from 'redux-thunk'
import {
  IDataCompressor,
  IWETHGateway,
  PathFinder
} from '@gearbox-protocol/sdk'
import { Wallets } from '../../config/connectors'
// import { CreditAccountsAction } from "../creditAccounts";
import { EVMTx } from '@gearbox-protocol/sdk/lib/core/eventOrTx'

export const web3Selector = (state: RootState) => state.web3

export type Web3Status = 'WEB3_STARTUP' | 'WEB3_CONNECTED' | 'NO_WEB3'

export type Web3Error = 'NO_ERROR' | 'CONNECTION_ERROR' | 'WRONG_NETWORK_ERROR'

export type Web3Actions =
  | {
      type: 'WEB3_RESET'
    }
  | {
      type: 'WEB3_INIT'
    }
  | {
      type: 'PROVIDER_CONNECTED'
      payload: {
        chainId: number
        provider: ethers.providers.JsonRpcProvider
        dataCompressor: IDataCompressor
        gearTokenAddress: string
        wethTokenAddress: string
        pathFinder: PathFinder
        etherscan: string
      }
    }
  | {
      type: 'WEB3_CONNECTED'
      payload: {
        account: string
        signer: Signer

        // leveragedActions: LeveragedActions,
        wethGateway: IWETHGateway
      }
    }
  | {
      type: 'WALLET_SET'
      payload: Wallets | undefined
    }
  | {
      type: 'WEB3_FAILED'
      payload: { error: Web3Error; chainId?: number }
    }
  | {
      type: 'WEB3_BALANCE_SUCCESS'
      payload: BigNumberish
    }
  | {
      type: 'LISTENERS_ADDED'
      payload: string
    }
  | {
      type: 'UPSERT_PENDING_TX'
      payload: { account: string; tx: EVMTx }
    }
  | {
      type: 'UPDATE_ALL_TX'
      payload: { account: string; txs: Array<EVMTx> }
    }

export type ThunkWeb3Action = ThunkAction<void, RootState, unknown, Web3Actions>

export function getSignerOrThrow(getState: () => RootState): Signer {
  const { signer } = getState().web3
  if (!signer) {
    throw new Error('Pool: Cant connect vault contract')
  }
  return signer
}

export function getWETHGatewayOrThrow(getState: () => RootState): IWETHGateway {
  const { wethGateway } = getState().web3
  if (!wethGateway) {
    throw new Error('Cant get WETH Gateway')
  }
  return wethGateway
}
