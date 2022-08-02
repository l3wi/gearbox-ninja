import {
  Stage,
  game,
  input,
  state,
  event,
  ColorLayer,
  BitmapText
} from 'melonjs/dist/melonjs.module.js'

import { store } from '../../store'
import actions from '../../store/actions'

class Web3Screen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // add a gray background to the default Stage
    game.world.addChild(new ColorLayer('background', '#202020'))

    document.getElementById('submit').onclick = function (e) {
      store.dispatch(actions.form.sendTransaction())
    }

    this.input = document.querySelector('input')

    this.input.addEventListener('input', (e: any) => {
      store.dispatch(actions.form.updateForm(e.target.value))
    })

    document.getElementById('max').onclick = function (e) {
      store.dispatch(actions.form.maxAmount())
    }

    // Cancel out of screen
    input.bindKey(input.KEY.ESC, 'esc', true)
    event.once(event.KEYDOWN, function (action: string) {
      if (action === 'esc') {
        store.dispatch(actions.form.toggleForm())
        store.dispatch(actions.game.ChangeStage('PLAY'))
      }
    })
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {
    input.unbindKey(input.KEY.ESC)
    this.input.removeEventListener('input')
  }

  input: any
}

export default Web3Screen
