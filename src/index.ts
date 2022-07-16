import 'index.css'

import redux, { store } from './store'
import actions from './store/actions'

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
})
