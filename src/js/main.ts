import "../css/main.css";
import {
  video,
  audio,
  loader,
  state,
  pool,
  utils,
  plugin,
  device,
} from "melonjs";
import PlayerEntity from "./entities/player";
import PlayScreen from "./screens/play";
import TitleScreen from "./screens/title";
import DataManifest from "./manifest.js";

class Bootstrap {
  constructor() {
    // Initialize the video.
    // initialize the display canvas once the device/browser is ready
    if (!video.init(1218, 562, { parent: "screen", scale: "auto" })) {
      alert("Your browser does not support HTML5 canvas.");
      return;
    }

    // initialize the debug plugin in development mode.
    // if (process.env.NODE_ENV === "development") {
    //   import("./js/plugin/debug/debugPanel.js").then((debugPlugin) => {
    //     // automatically register the debug panel
    //     utils.function.defer(
    //       plugin.register,
    //       this,
    //       debugPlugin.DebugPanelPlugin,
    //       "debugPanel"
    //     );
    //   });
    // }

    // Initialize the audio.
    audio.init("mp3,ogg");

    // allow cross-origin for image/texture loading
    // loader.crossOrigin = "anonymous";

    // set and load all resources.
    loader.preload(DataManifest, function () {
      // set the user defined game stages
      state.set(state.MENU, new TitleScreen());
      state.set(state.PLAY, new PlayScreen());

      // add our player entity in the entity pool
      pool.register("mainPlayer", PlayerEntity);

      // Start the game.
      state.change(state.PLAY, false);
    });
  }

  static boot() {
    const bootstrap = new Bootstrap();

    // Mobile browser hacks
    // if (device.isMobile) {
    //   // Prevent the webview from moving on a swipe
    //   window.document.addEventListener(
    //     "touchmove",
    //     function (e) {
    //       e.preventDefault();
    //       window.scroll(0, 0);
    //       return false;
    //     },
    //     false
    //   );

    //   me.event.subscribe(me.event.WINDOW_ONRESIZE, () => {
    //     window.scrollTo(0, 1);
    //   });
    // }

    return bootstrap;
  }
}

window.addEventListener("load", () => {
  Bootstrap.boot();
});
