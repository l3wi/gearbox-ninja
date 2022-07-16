import {
  Stage,
  level,
  game,
  input,
  pool,
  Vector2d
} from 'melonjs/dist/melonjs.module.js'
// import PlayerEntity from '../renderables/player'
import { store } from '../../store'

class PlayScreen extends Stage {
  player = {}
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // enable the keyboard
    input.bindKey(input.KEY.LEFT, 'left')
    input.bindKey(input.KEY.RIGHT, 'right')
    input.bindKey(input.KEY.X, 'jump', true)
    input.bindKey(input.KEY.UP, 'jump', true)
    input.bindKey(input.KEY.SPACE, 'jump', true)
    input.bindKey(input.KEY.DOWN, 'down', true)
    input.bindKey(input.KEY.S, 'down', true)

    // load a level
    level.load('app')

    const { lastPosition } = store.getState().game
    console.log(lastPosition)
    this.player = pool.pull('mainPlayer', lastPosition.x, lastPosition.y, {
      name: 'mainPlayer',
      framewidth: 64,
      image: 'gripe_run_right',
      anchorPoint: new Vector2d(0.5, 0)
    })

    // @ts-ignore
    game.world.addChild(this.player, 1)
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {
    console.log('Leaving Screen')
    // @ts-ignore
    game.world.removeChild(this.player, 1)
  }
}

export default PlayScreen
