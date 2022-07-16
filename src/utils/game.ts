import { store } from '../store'
import actions from '../store/actions'

// Game Utils
// 1. Initalise game
// 2. Change game state
// 3. Navigate between w/ mainPlayer position preserved
// 4. Debounce actions/collisions to keep things pretty

export const init = async (w: number, h: number) => {
  store.dispatch(actions.game.InitGame(w, h))
}

const registerStage = (stage: any) => {}

export const changeStage = async () => {}
