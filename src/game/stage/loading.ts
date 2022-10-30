import {
  game,
  loader,
  Sprite,
  Stage,
  video,
} from "melonjs/dist/melonjs.module.js";

class LoadingScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // set a background color
    game.world.backgroundColor.parseCSS("#000");
  }

  /**
   * Called by engine before deleting the object
   * @ignore
   */
  onDestroyEvent() {}
}

export default LoadingScreen;
