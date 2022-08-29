import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import { store } from './store'
import Page from './components/page'
import { Provider } from 'react-redux'

const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  )
}

export default App
