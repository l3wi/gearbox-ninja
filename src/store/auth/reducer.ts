import { AuthActions } from './index'

export interface AuthState {
  notIllegal: boolean
  pending: boolean
}

const initialState: AuthState = {
  notIllegal: false,
  pending: false
}

export function authReducer(
  state: AuthState = initialState,
  action: AuthActions
): AuthState {
  switch (action.type) {
    case 'SIGN_MESSAGE':
      return {
        ...state,
        notIllegal: action.payload.notIllegal,
        pending: false
      }
    case 'PENDING_SIGNATURE':
      return {
        ...state,
        pending: true
      }
  }

  return state
}
