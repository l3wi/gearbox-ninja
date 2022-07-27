import { SyncActions } from './index'

import { EventOrTx } from '@gearbox-protocol/sdk/lib/core/eventOrTx'

export interface SyncState {
  lastBlock: number
  events: Record<string, Record<string, EventOrTx>>
  lastPoolSync: Record<string, number>
  lastCreditManagerSync: Record<string, number>
}

const initialState: SyncState = {
  lastBlock: 0,
  events: {},
  lastPoolSync: {},
  lastCreditManagerSync: {}
}

export function syncReducer(
  state: SyncState = initialState,
  action: SyncActions
): SyncState {
  switch (action.type) {
    case 'SYNC_LASTBLOCK':
      return {
        ...state,
        lastBlock: action.payload
      }

    case 'EVENT_UPDATE':
      const existingEvents = state.events[action.payload.account] || {}
      const newEvents = { ...existingEvents, ...action.payload.events }
      const { account } = action.payload
      return {
        ...state,
        events: {
          ...state.events,
          [action.payload.account]: newEvents
        },
        lastPoolSync: {
          ...state.lastPoolSync,
          [account]: action.payload.poolSync || state.lastPoolSync[account] || 0
        },
        lastCreditManagerSync: {
          ...state.lastCreditManagerSync,
          [account]:
            action.payload.creditManagerSync ||
            state.lastCreditManagerSync[account] ||
            0
        }
      }
  }

  return state
}
