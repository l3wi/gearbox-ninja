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
import actions from '../../store/actions'
import HUD from '../renderables/hud'

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
    store.dispatch(actions.game.BeginStage())
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {
    // remove the HUD from the game world
    const { hud } = store.getState().game
    game.world.removeChild(hud)
  }

  HUD: any
}

export default PlayScreen
