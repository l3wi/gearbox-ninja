import { constantsSol } from '@gearbox-protocol/sdk/lib/types/contracts/test/lib'
import { Renderable, BitmapText, game, Container, Color } from 'melonjs'
import { store } from '../../store'

export default class PauseContainer extends Container {
  constructor() {
    super()

    // persistent across level change
    this.isPersistent = true
    this.alwaysUpdate = true

    // make sure we use screen coordinates
    this.floating = true

    // give a name
    this.name = 'PAUSE'
  }

  update() {
    return false
  }
}

export class PauseOverlay extends Renderable {
  constructor(name: string, z?: number) {
    super(0, 0, Infinity, Infinity)
    this.onResetEvent(name, z)
  }

  color: Color

  onResetEvent(name: string, z = 0) {
    this.name = name
    this.pos.z = z
    this.floating = true
    this.color = new Color(0, 0, 0, 0.5)
  }

  draw(renderer: any, viewport: any) {
    renderer.save()
    renderer.clipRect(0, 0, viewport.width, viewport.height)
    renderer.clearColor(this.color)
    renderer.restore()
  }

  destroy() {
    super.destroy()
  }
}

export class TextSegment extends Renderable {
  constructor(x: number, y: number, text: string) {
    super(x, y, 10, 10)

    // create the font object
    this.font = new BitmapText(x, y, {
      font: 'PressStart2P',
      size: 1
    })

    // font alignment to right, bottom
    this.font.textAlign = 'center'
    this.font.textBaseline = 'middle'

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
