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
    game.world.backgroundColor.parseCSS("#202020");

    loader.load(
      {
        name: "gear",
        type: "image",
        src: "./data/img/gear.png",
      },
      () => {
        game.world.addChild(
          new Sprite(
            video.renderer.getWidth() / 2,
            video.renderer.getHeight() / 2,
            {
              image: "gear",
              framewidth: 102,
              frameheight: 102,
            }
          ),
          2
        );
      },
      (err: any) => {
        alert(err);
      }
    );
  }

  /**
   * Called by engine before deleting the object
   * @ignore
   */
  onDestroyEvent() {
    // cancel the callback
    loader.unload({ name: "gear", type: "image" });
  }
}

export default LoadingScreen;
