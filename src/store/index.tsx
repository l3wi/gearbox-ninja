import { applyMiddleware, Middleware, createStore, Store } from 'redux'
import reducer from './reducer'
import thunk from 'redux-thunk'

export type RootState = ReturnType<typeof reducer>

// Ghetto logger
const logger: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Skipp logger for notifications
  if (action.type === 'UPDATE_NOTIFICATION') return next(action)
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

function configureStore() {
  return createStore(reducer, applyMiddleware(thunk, logger))
}

export let store: Store<RootState>
export const init = () => {
  store = configureStore()
}

export default { store, init }
