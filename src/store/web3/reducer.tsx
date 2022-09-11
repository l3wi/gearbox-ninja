import {
  EVMTx,
  IDataCompressor,
  IPathFinder,
  IWETHGateway
} from '@gearbox-protocol/sdk'
import { BigNumberish, providers, Signer } from 'ethers'

import type { Web3Actions, Web3Error, Web3Status } from './index'

export interface Web3State {
  provider?: providers.JsonRpcProvider
  signer?: Signer
  account?: string

  dataCompressor?: IDataCompressor
  balance?: BigNumberish
  gearTokenAddress?: string
  wethGateway?: IWETHGateway
  wethTokenAddress?: string
  pathFinder?: IPathFinder

  status: Web3Status
  error?: Web3Error
  listeners: Record<string, boolean>
  transactions: Record<string, Array<EVMTx>>
}

const initialState: Web3State = {
  status: 'WEB3_STARTUP',
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
        status: 'WEB3_STARTUP',
        error: undefined,
        listeners: {}
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

    case 'WEB3_BALANCE_SUCCESS':
      return {
        ...state,
        balance: action.payload
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

    default:
      return state
  }
}
