import { Stage, level, game, input, pool } from 'melonjs/dist/melonjs.module.js'
// import PlayerEntity from '../renderables/player'
import { store } from '../../store'

class PlayScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    const { lastPosition } = store.getState().game

    // enable the keyboard
    input.bindKey(input.KEY.LEFT, 'left')
    input.bindKey(input.KEY.RIGHT, 'right')
    // map X, Up Arrow and Space for jump
    input.bindKey(input.KEY.X, 'jump', true)
    input.bindKey(input.KEY.UP, 'jump', true)
    input.bindKey(input.KEY.SPACE, 'jump', true)

    // load a level
    level.load('app')

    const player = pool.pull('mainPlayer', lastPosition.x, lastPosition.y, {
      name: 'mainPlayer',
      framewidth: 64,
      image: 'gripe_run_right'
    })

    // @ts-ignore
    game.world.addChild(player, 1)
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {}
}

export default PlayScreen
