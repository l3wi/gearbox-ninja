import {
  Stage,
  game,
  input,
  ColorLayer,
  BitmapText
} from 'melonjs/dist/melonjs.module.js'

class TitleScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // add a gray background to the default Stage
    game.world.addChild(new ColorLayer('background', '#202020'))

    // add a font text display object
    game.world.addChild(
      // @ts-ignore
      new BitmapText(game.viewport.width / 2, game.viewport.height / 2, {
        font: 'PressStart2P',
        size: 2.0,
        textBaseline: 'middle',
        textAlign: 'center',
        text: 'Hello Ninjas!'
      })
    )

    game.world.addChild(
      // @ts-ignore
      new BitmapText(game.viewport.width / 2, game.viewport.height / 2 + 100, {
        font: 'PressStart2P',
        size: 1.0,
        textBaseline: 'middle',
        textAlign: 'center',
        text: 'Press SPACE to start'
      })
    )
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {
    // TODO
  }
}

export default TitleScreen
