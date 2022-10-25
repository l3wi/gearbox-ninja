import { Container } from "melonjs";
import { ThunkAction } from "redux-thunk";

import { RootState } from "../index";
import { Notification } from "./reducer";

export type GameActions =
  | {
      type: "INIT_GAME";
    }
  | {
      type: "PAUSE_GAME";
      payload: { pause: string };
    }
  | {
      type: "RESUME_GAME";
    }
  | {
      type: "REGISTER_STAGE";
      payload: { key: string; stage: any };
    }
  | {
      type: "CHANGE_STAGE";
      payload: {
        currentStage: string;
        lastPosition?: { x: number; y: number };
      };
    }
  | {
      type: "BEGIN_STAGE";
    }
  | {
      type: "SIGNED_MESSAGE";
      payload: { isIllegal: boolean; signRejected?: boolean };
    }
  | {
      type: "UPDATE_NOTIFICATION";
      payload: { notification: Notification | null };
    }
  | {
      type: "UPDATE_PAUSE";
      payload: { pause: string };
    };

export type GameThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  GameActions
>;
