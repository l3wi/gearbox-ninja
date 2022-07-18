import { ThunkAction } from 'redux-thunk'
import { RootState } from '../index'

export type FormActions =
  | {
      type: 'TOGGLE_FORM'
    }
  | {
      type: 'CLEAR_FORM'
    }
  | {
      type: 'POPULATE_FORM'
      payload: {
        title: string
        description: string
        symbol: string
      }
    }
  | {
      type: 'UPDATE_FORM'
      payload: {
        value: number
      }
    }

export type FormThunkAction = ThunkAction<void, RootState, unknown, FormActions>
