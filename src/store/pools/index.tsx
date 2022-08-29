import { RootState } from '../index'
import { ThunkAction } from 'redux-thunk'
import { PoolData } from '@gearbox-protocol/sdk'

export type PoolAction =
  | {
      type: 'POOL_LIST_SUCCESS'
      payload: Record<string, PoolData>
    }
  | {
      type: 'POOL_LIST_FAILURE'
      payload: Error
    }

export type PoolThunkAction = ThunkAction<void, RootState, unknown, PoolAction>

export const poolsListSelector = (state: RootState) => state.pools.data
export const poolsListErrorSelector = (state: RootState) => state.pools.error
