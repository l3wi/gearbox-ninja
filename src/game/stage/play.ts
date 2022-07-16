import { Stage, level, game, input } from 'melonjs/dist/melonjs.module.js'

import { store } from '../../store'

class PlayScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    const { game } = store.getState()
    console.log(game)
    // enable the keyboard
    input.bindKey(input.KEY.LEFT, 'left')
    input.bindKey(input.KEY.RIGHT, 'right')
    // map X, Up Arrow and Space for jump
    input.bindKey(input.KEY.X, 'jump', true)
    input.bindKey(input.KEY.UP, 'jump', true)
    input.bindKey(input.KEY.SPACE, 'jump', true)

    // load a level
    level.load('app')
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {}
}

export default PlayScreen
