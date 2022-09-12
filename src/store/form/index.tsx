import { PoolData } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'
import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'

export type FormActions =
  | {
      type: 'TOGGLE_FORM'
      payload: {
        symbol: string
        type: string
      }
    }
  | {
      type: 'CLEAR_FORM'
    }
  | {
      type: 'UPDATE_FORM'
      payload: {
        value: number
      }
    }

export type FormThunkAction = ThunkAction<void, RootState, unknown, FormActions>
