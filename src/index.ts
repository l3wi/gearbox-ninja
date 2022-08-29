import 'index.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import redux, { store } from './store'
import actions from './store/actions'

import App from './app'

// @ts-ignore
if (module.hot) module.hot.accept()

window.addEventListener('load', () => {
  console.log('Ready to Go')

  /// Startup ////
  ////////////////

  /// Init redux
  redux.init()

  // Init game
  store.dispatch(actions.game.InitGame())
  store.dispatch(actions.web3.connectProvider())

  // Setup React app
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(App())
})
