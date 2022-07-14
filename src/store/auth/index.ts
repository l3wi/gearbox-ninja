import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'

export const endpoint_user = '/api'

export type AuthActions =
  | {
      type: 'SIGN_MESSAGE'
      payload: { notIllegal: boolean }
    }
  | {
      type: 'PENDING_SIGNATURE'
    }

export type AuthThunkAction = ThunkAction<void, RootState, unknown, AuthActions>
