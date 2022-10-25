import {
  event,
  game,
  input,
  level,
  Stage,
} from "melonjs/dist/melonjs.module.js";

// import PlayerEntity from '../renderables/player'
import { store } from "../../store";
import actions from "../../store/actions";

class PlayScreen extends Stage {
  player = {};
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // enable the keyboard
    input.bindKey(input.KEY.LEFT, "left");
    input.bindKey(input.KEY.RIGHT, "right");
    input.bindKey(input.KEY.X, "jump", true);
    input.bindKey(input.KEY.UP, "jump", true);
    input.bindKey(input.KEY.SPACE, "jump", true);
    input.bindKey(input.KEY.DOWN, "down", true);
    input.bindKey(input.KEY.S, "down", true);

    // Cancel out of screen
    input.bindKey(input.KEY.ESC, "esc", true);
    event.on(event.KEYDOWN, (action: string) => {
      if (action === "esc") {
        store.dispatch(actions.game.PauseGame());
      }
    });

    // load a level
    level.load("app");
    store.dispatch(actions.game.BeginStage());

    const { web3, game: gameState } = store.getState();
    const { nftClaimed } = web3;
    const { currentStage } = gameState;
    if (nftClaimed) game.world.getChildByName("bridge")[0].setOpacity(1);
  }

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent() {}
}

export default PlayScreen;
