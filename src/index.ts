import {
  audio,
  loader,
  state,
  device,
  video,
  utils,
  plugin,
  input,
  pool
} from 'melonjs/dist/melonjs.module.js'

import 'index.css'

import TitleScreen from './js/stage/title'
import PlayScreen from './js/stage/play'
import PlayerEntity from './js/renderables/player'

import DataManifest from './manifest'

const init = (w: number, h: number) => {
  // initialize the display canvas once the device/browser is ready
  video.init(w, h, {
    parent: 'screen',
    scale: 'auto',
    scaleMethod: 'fill'
  })

  // Initialize the audio.
  audio.init('mp3,ogg')

  // set and load all resources.
  loader.preload(DataManifest, function () {
    // set the user defined game stages
    state.set(state.MENU, new TitleScreen())
    state.set(state.PLAY, new PlayScreen())

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

    // Start the game
    state.change(state.PLAY, false)
  })
}

window.addEventListener('load', () => {
  const h = window.innerHeight
  const w = window.innerWidth
  console.log('Ready to Go')
  init(w, h)
})
