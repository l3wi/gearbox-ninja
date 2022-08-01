import { constantsSol } from '@gearbox-protocol/sdk/lib/types/contracts/test/lib'
import { Renderable, BitmapText, game, Container, Color } from 'melonjs'
import { store } from '../../store'

export default class HUDContainer extends Container {
  constructor() {
    super()

    // persistent across level change
    this.isPersistent = true

    // make sure we use screen coordinates
    this.floating = true

    // give a name
    this.name = 'HUD'
  }
}

export class Notification extends Renderable {
  constructor(x: number, y: number, text: string) {
    super(x, y, 10, 10)

    // create the font object
    this.font = new BitmapText(0, 0, { font: 'PressStart2P' })

    // font alignment to right, bottom
    this.font.textAlign = 'right'
    this.font.textBaseline = 'bottom'

    // local copy of the global score
    this.text = text
  }

  update() {
    return false
  }

  draw(renderer: any) {
    this.font.draw(
      renderer,
      this.text,
      game.viewport.width + this.pos.x,
      game.viewport.height + this.pos.y
    )
  }

  font
  text = ''
}
