import { FormActions } from './index'

export interface FormState {
  isHidden: boolean
  isMax: boolean
  value: number
  title: string
  description: string
  symbol: string
}

const initialState: FormState = {
  isHidden: true,
  isMax: false,
  value: 0,
  title: '',
  description: '',
  symbol: ''
}

export function formReducer(
  state: FormState = initialState,
  action: FormActions
): FormState {
  switch (action.type) {
    case 'TOGGLE_FORM':
      return {
        ...state,
        isHidden: !state.isHidden
      }
    case 'CLEAR_FORM':
      return {
        ...state
      }
    case 'POPULATE_FORM':
      return {
        ...state,
        title: action.payload.title,
        description: action.payload.description,
        symbol: action.payload.symbol
      }
    case 'UPDATE_FORM':
      return {
        ...state,
        value: action.payload.value
      }
  }

  return state
}
