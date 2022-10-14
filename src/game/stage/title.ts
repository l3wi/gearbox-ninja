import {
  Stage,
  game,
  input,
  state,
  Sprite,
  loader,
  event,
  ColorLayer,
  BitmapText
} from 'melonjs/dist/melonjs.module.js'

import { store } from '../../store'
import actions from '../../store/actions'

class TitleScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // new sprite for the title screen, position at the center of the game viewport
    // var backgroundImage = new Sprite(
    //   game.viewport.width / 2,
    //   game.viewport.height / 2,
    //   {
    //     image: loader.getImage('start')
    //   }
    // )
    // // scale to fit with the viewport size
    // backgroundImage.scale(
    //   game.viewport.height / backgroundImage.height,
    //   game.viewport.height / backgroundImage.height
    // )
    // // add to the world container
    // game.world.addChild(backgroundImage, 1)
    // add a gray background to the default Stage
    // game.world.addChild(new ColorLayer('background', '#202020'))
    // add a font text display object
    // game.world.addChild(
    //   // @ts-ignore
    //   new BitmapText(game.viewport.width / 2, game.viewport.height / 2, {
    //     font: 'PressStart2P',
    //     size: 1.0,
    //     textBaseline: 'middle',
    //     textAlign: 'center',
    //     text: 'Hello Ninjas!'
    //   })
    // )
    // game.world.addChild(
    //   // @ts-ignore
    //   new BitmapText(game.viewport.width / 2, game.viewport.height / 2 + 50, {
    //     font: 'PressStart2P',
    //     size: 0.5,
    //     textBaseline: 'middle',
    //     textAlign: 'center',
    //     text: 'Press ENTER to start'
    //   })
    // )
    // input.bindKey(input.KEY.ENTER, 'enter', true)
    // event.once(event.KEYDOWN, function (action: string) {
    //   if (action === 'enter') {
    //     store.dispatch(actions.game.ChangeStage('PLAY'))
    //   }
    // })
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {
    input.unbindKey(input.KEY.ENTER)
  }
}

export default TitleScreen
