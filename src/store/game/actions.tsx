import axios from "axios";
import {
  audio,
  game,
  loader,
  pool,
  state,
  Vector2d,
  video,
} from "melonjs/dist/melonjs.module.js";
import { getAuthUrl } from "../../config";

import DataManifest from "../../game/manifest";
import PlayerEntity from "../../game/renderables/player";
import LoadingScreen from "../../game/stage/loading";
import PlayScreen from "../../game/stage/play";
import TitleScreen from "../../game/stage/title";
import Web3Screen from "../../game/stage/web3";
import actions from "../actions";
import { store } from "../index";
import { GameThunkAction } from "./index";
import { Stages } from "./reducer";

export const InitGame =
  (w: number, h: number): GameThunkAction =>
  async (dispatch, getState) => {
    console.log("Initializing Game");
    try {
      // initialize the display canvas once the device/browser is ready
      video.init(1024, 512, {
        parent: "screen",
        scale: "auto",
        scaleMethod: "flex-width",
      });

      // Initialize the audio.
      audio.init("mp3,ogg");

      // Load & Init the loading screen
      store.dispatch(
        actions.game.RegisterScreen("LOADING", new LoadingScreen()),
      );
      store.dispatch(actions.game.ChangeStage("LOADING"));

      loader.preload(DataManifest, () => {
        // Set default state transition
        state.transition("fade", "#202020", 500);

        // Register Stages into the game
        store.dispatch(actions.game.RegisterScreen("MENU", new TitleScreen()));
        store.dispatch(actions.game.RegisterScreen("PLAY", new PlayScreen()));
        store.dispatch(
          actions.game.RegisterScreen("CREDITS", new Web3Screen()),
        );

        // add our player entity in the entity pool
        pool.register("mainPlayer", PlayerEntity);

        store.dispatch(actions.game.ChangeStage("MENU"));
      });
    } catch (e: any) {
      console.error("Error Init(): " + e);
    }
  };

export const ChangeStage =
  (key: keyof Stages, pos?: { x: number; y: number }): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      const { stages, currentStage, lastPosition, track } = getState().game;
      if (!stages[key]) return console.error("Error: Stage doesn't exist");

      // If PLAY & pos, save player pos
      if (currentStage === "PLAY" && pos) {
        // @ts-ignore
        state.change(state[key], false); // pls fix
        dispatch({
          type: "CHANGE_STAGE",
          payload: { currentStage: key, lastPosition: { x: pos.x, y: pos.y } },
        });
      } else {
        if (currentStage === "MENU" && key === "PLAY" && track)
          audio.playTrack("background_8bit", 0.5);

        // @ts-ignore
        state.change(state[key], false); // pls fix
        dispatch({
          type: "CHANGE_STAGE",
          payload: { currentStage: key },
        });
      }
    } catch (e: any) {
      console.error("Error ChangeStage(): " + e);
    }
  };

export const BeginStage = (): GameThunkAction => async (dispatch, getState) => {
  try {
    const { lastPosition } = getState().game;
    const player = pool.pull("mainPlayer", lastPosition.x, lastPosition.y, {
      name: "mainPlayer",
      framewidth: 64,
      image: "ninja-smol",
      anchorPoint: new Vector2d(0, 0),
    });

    // @ts-ignore
    game.world.addChild(player, 3);

    dispatch({ type: "BEGIN_STAGE" });
  } catch (e: any) {
    console.error("Error BeginStage(): " + e);
  }
};

export const RegisterScreen =
  (key: any, stage: any): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      // @ts-ignore
      state.set(state[key], stage); // pls fix
      dispatch({ type: "REGISTER_STAGE", payload: { key, stage } });
    } catch (e: any) {
      console.error("Error RegisterScreen(): " + e);
    }
  };

export const ToggleMusic =
  (text?: string): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      let { track } = getState().game;
      store.dispatch({ type: "TOGGLE_MUSIC", payload: !track });
    } catch (e: any) {
      console.error("Error PauseGame(): " + e);
    }
  };

export const PauseGame =
  (text?: string): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      let { isPaused, track } = getState().game;
      if (isPaused && !text) {
        state.resume();
        console.log(audio);
        if (track) audio.unmuteAll();
        dispatch({ type: "RESUME_GAME" });
      } else {
        state.pause();
        audio.muteAll();
        dispatch({ type: "PAUSE_GAME", payload: { pause: text } });
      }
    } catch (e: any) {
      console.error("Error PauseGame(): " + e);
    }
  };

export const AddNotification =
  (text: string, duration = 3000): GameThunkAction =>
  async (dispatch, getState) => {
    let { notification } = getState().game;

    if (!notification || notification.duration === 0) {
      try {
        dispatch({
          type: "UPDATE_NOTIFICATION",
          payload: { notification: { value: text, duration } },
        });
        if (duration != 0) {
          setTimeout(() => {
            dispatch({
              type: "UPDATE_NOTIFICATION",
              payload: { notification: null },
            });
          }, duration);
        }
      } catch (e: any) {
        console.error("Error AddNotification(): " + e);
      }
    }
  };

export interface AgreementResponse {
  access: string;
}
export const ENDPOINT_USER = "/api";

export const signDeclaration =
  (): GameThunkAction => async (dispatch, getState) => {
    try {
      const { account, signer } = getState().web3;
      if (!account || !signer) throw new Error("No account selected");

      const agreement =
        "By accessing or using Gearbox App, I agree to the Terms of Service (https://gearbox.fi/terms) and confirm that I have read and understood the Privacy Notice (https://gearbox.fi/privacy) and Risk Disclosure Statement (https://gearbox.fi/risks).\n" +
        "I hereby further represent and warrant that:\n" +
        "- I’m not a resident of or located in the United States of America (including its territories: American Samoa, Guam, Puerto Rico, the Northern Mariana Islands and the U.S. Virgin Islands) or any other Restricted Jurisdiction (as defined in the Terms of Service);\n" +
        "- I’m not a Prohibited Person (as defined in the Terms of Service) nor acting on behalf of a Prohibited Person;\n" +
        "- I understand that if I fail to maintain sufficient collateral when using the Gearbox Protocol, my credit account(s) may be liquidated, in which case a penalty may be charged by the protocol;\n" +
        "- I acknowledge that Gearbox App and related software are experimental, and that the use of experimental software may result in complete loss of my funds.";
      dispatch(actions.game.AddNotification("Waiting for Signer"));

      const signature = await signer.signMessage(agreement);
      dispatch(actions.game.AddNotification("Signed Declaration", 2000));

      try {
        const result = await axios.post<AgreementResponse>(
          getAuthUrl(`${ENDPOINT_USER}/signup/`),
          { account, signature },
        );
      } catch (error) {
        console.log(error);
      }

      dispatch({
        type: "SIGNED_MESSAGE",
        payload: { isIllegal: false },
      });
    } catch (e: any) {
      dispatch(actions.game.AddNotification("Signature Error"));
      dispatch({
        type: "SIGNED_MESSAGE",
        payload: { isIllegal: true, signRejected: true },
      });
      console.error("Cant signup: " + e);
    }
  };
