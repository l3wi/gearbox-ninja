import 'index.css'

import redux from './store'
import { connect, activate } from './utils/web3'
import { init } from './utils/game'

window.addEventListener('load', async () => {
  const h = window.innerHeight
  const w = window.innerWidth
  console.log('Ready to Go')

  /// Startup ////
  ////////////////

  /// Init redux
  redux.init()

  // Init game
  init(w, h)
})
