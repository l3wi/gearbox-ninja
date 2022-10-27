import { lazy } from "react";

// @ts-ignore
if (module.hot) module.hot.accept();
window.addEventListener("load", () => begin());

const begin = async () => {
  const h = window.innerHeight;
  const w = window.innerWidth;
  console.log("Ready to Go");

  /// Startup ////
  import("./store").then(async obj => {
    /// Init redux
    await obj.setup();
    const { store, actions } = obj;
    // Init game
    const { game } = store.getState();

    // Allow game time to init
    setTimeout(() => {
      if (game && !game.isInit) store.dispatch(actions.game.InitGame(w, h));
      store.dispatch(actions.web3.connectProvider());

      // Import React Root
      const App = lazy(() => import("./app"));

      // Setup React app
      import("react-dom/client").then(ReactDOM => {
        const node = document.getElementById("root")!;
        const root = ReactDOM.createRoot(node);
        root.render(<App />);
      });
    }, 100);
  });
};
