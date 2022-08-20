import 'index.css'

import * as React from 'react'
import { render } from 'react-dom'
import redux, { store } from './store'
import actions from './store/actions'
import { activate } from './utils/web3'

const App = () => {
  return <h1>My React and TypeScript App!</h1>
}

window.addEventListener('load', async () => {
  const h = window.innerHeight
  const w = window.innerWidth
  console.log('Ready to Go')

  /// Startup ////
  ////////////////

  /// Init redux
  redux.init()

  // Init game
  store.dispatch(actions.game.InitGame(w, h))
  store.dispatch(actions.web3.connectProvider())

  // Setup React app
  render(<App />, document.getElementById('root'))
})
