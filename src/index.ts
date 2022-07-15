import {
  audio,
  loader,
  state,
  video,
  input,
  pool
} from 'melonjs/dist/melonjs.module.js'

import 'index.css'

import TitleScreen from './game/stage/title'
import PlayScreen from './game/stage/play'
import LoadingScreen from './game/stage/loading'
import PlayerEntity from './game/renderables/player'
import DataManifest from './manifest'

import redux from './store'
import { connect, activate } from './utils/web3'

const init = (w: number, h: number) => {
  // initialize the display canvas once the device/browser is ready
  video.init(1024, 512, {
    parent: 'screen',
    scale: 'auto',
    scaleMethod: 'flex-width'
  })

  // Initialize the audio.
  audio.init('mp3,ogg')

  // Start the game
  state.set(state.LOADING, new LoadingScreen())
  state.change(state.LOADING, false)

  // set and load all resources.
  loader.preload(DataManifest, function () {
    state.set(state.MENU, new TitleScreen())
    state.set(state.PLAY, new PlayScreen())

    state.transition('fade', '#000', 250)

    // add our player entity in the entity pool
    pool.register('mainPlayer', PlayerEntity)
    // pool.register('CoinEntity', CoinEntity)
    // pool.register('EnemyEntity', EnemyEntity)

    // enable the keyboard
    input.bindKey(input.KEY.LEFT, 'left')
    input.bindKey(input.KEY.RIGHT, 'right')
    // map X, Up Arrow and Space for jump
    input.bindKey(input.KEY.X, 'jump', true)
    input.bindKey(input.KEY.UP, 'jump', true)
    input.bindKey(input.KEY.SPACE, 'jump', true)

    state.change(state.MENU, false)
  })
}

window.addEventListener('load', async () => {
  const h = window.innerHeight
  const w = window.innerWidth
  console.log('Ready to Go')
  init(w, h)

  /// initialize redux factory
  redux.init()
  // connect()
  // activate('metamask')
})
