import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'
import { OperationActions } from '../operations'
import { EventOrTx } from '@gearbox-protocol/sdk/lib/core/eventOrTx'
import { Web3Actions } from '../web3'
import { TokenAction } from '../tokens'

export type SyncActions =
  | {
      type: 'SYNC_LASTBLOCK'
      payload: number
    }
  | {
      type: 'EVENT_UPDATE'
      payload: {
        account: string
        events: Record<string, EventOrTx>
        poolSync?: number
        creditManagerSync?: number
      }
    }

export type SyncThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  SyncActions | OperationActions | Web3Actions | TokenAction
>
