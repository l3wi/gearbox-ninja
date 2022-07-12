import { Stage, level, game } from 'melonjs/dist/melonjs.module.js'

class PlayScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // load a level
    level.load('app')
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {}
}

export default PlayScreen
