import * as ReactDOM from 'react-dom/client'
import App from './app'

import { init, store } from './store'
import actions from './store/actions'
// @ts-ignore
if (module.hot) module.hot.accept()

window.addEventListener('load', () => begin())

const begin = async () => {
  const h = window.innerHeight
  const w = window.innerWidth
  console.log('Ready to Go')

  /// Startup ////
  /// Init redux
  init()
  // Init game
  const { game } = store.getState()
  //@ts-ignore
  if (!game.isInit) store.dispatch(actions.game.InitGame(w, h))
  //@ts-ignore
  store.dispatch(actions.web3.connectProvider())

  // Setup React app
  const node = document.getElementById('root')!
  const root = ReactDOM.createRoot(node)
  root.render(<App />)
}
