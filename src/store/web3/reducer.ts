import { Web3Actions, Web3Error, Web3Status } from './index'
import {
  IDataCompressor,
  IWETHGateway,
  PathFinder
} from '@gearbox-protocol/sdk'
import { BigNumberish, providers, Signer } from 'ethers'
import { Wallets } from '../../config/connectors'
import { EVMTx } from '@gearbox-protocol/sdk/lib/core/eventOrTx'

export interface Web3State {
  provider?: providers.JsonRpcProvider
  signer?: Signer
  walletId?: Wallets
  account?: string

  dataCompressor?: IDataCompressor
  balance?: BigNumberish
  chainId?: number
  gearTokenAddress?: string
  wethGateway?: IWETHGateway
  wethTokenAddress?: string
  leveragedActions?: string
  pathFinder?: PathFinder
  etherscan: string

  status: Web3Status
  error?: Web3Error
  listeners: Record<string, boolean>
  transactions: Record<string, Array<EVMTx>>
}

const initialState: Web3State = {
  status: 'WEB3_STARTUP',
  etherscan: 'https://etherscan.io',
  listeners: {},
  transactions: {}
}

export function web3Reducer(
  state: Web3State = initialState,
  action: Web3Actions
): Web3State {
  switch (action.type) {
    case 'WEB3_RESET':
      return {
        ...state,
        signer: undefined,
        account: undefined,
        wethGateway: undefined,
        leveragedActions: undefined,
        status: 'WEB3_STARTUP',
        error: undefined,
        listeners: {}
      }

    case 'WEB3_INIT':
      return {
        ...state,
        status: 'WEB3_STARTUP',
        error: 'NO_ERROR'
      }

    case 'PROVIDER_CONNECTED':
      return {
        ...state,
        ...action.payload
      }

    case 'WEB3_CONNECTED':
      return {
        ...state,
        ...action.payload,
        status: 'WEB3_CONNECTED'
      }

    case 'WEB3_FAILED':
      return {
        ...state,
        account: undefined,
        signer: undefined,
        status: 'NO_WEB3',
        error: action.payload.error,
        chainId: action.payload.chainId
      }

    case 'WEB3_BALANCE_SUCCESS':
      return {
        ...state,
        balance: action.payload
      }

    case 'WALLET_SET':
      return {
        ...state,
        walletId: action.payload
      }

    case 'LISTENERS_ADDED':
      return {
        ...state,
        listeners: {
          ...state.listeners,
          [action.payload]: true
        }
      }

    case 'UPSERT_PENDING_TX':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.account]: [
            ...(state.transactions[action.payload.account] || []),
            action.payload.tx
          ]
        }
      }

    case 'UPDATE_ALL_TX':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.account]: action.payload.txs
        }
      }
  }

  return state
}
