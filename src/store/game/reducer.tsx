import { Container, game } from "melonjs";

import { GameActions, GameThunkAction } from "./index";
export type Stages = Record<string, any>;

export interface Notification {
  value: string;
  duration: number;
}

export interface GameState {
  isInit: boolean;
  isPaused: boolean;
  isIllegal: boolean;
  signRejected: boolean;
  notification: Notification | null;
  stages: Stages; // Need to fix (Stage Class)
  lastPosition: { x: number; y: number };
  currentStage: keyof Stages;
  pause: string | null;
  track: boolean;
}

const initialState: GameState = {
  isInit: false,
  isPaused: false,
  track: true,
  isIllegal: true,
  signRejected: true,
  notification: null,
  stages: {},
  lastPosition: { x: 2670, y: 0 },
  currentStage: "MENU",
  pause: null,
};

export function gameReducer(
  state: GameState = initialState,
  action: GameActions,
): GameState {
  switch (action.type) {
    case "INIT_GAME":
      return {
        ...state,
        isInit: true,
      };
    case "PAUSE_GAME":
      return {
        ...state,
        isPaused: true,
        pause: action.payload.pause,
      };
    case "RESUME_GAME":
      return {
        ...state,
        isPaused: false,
        pause: null,
      };
    case "BEGIN_STAGE":
      return {
        ...state,
      };
    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notification: action.payload.notification,
      };
    case "UPDATE_PAUSE":
      return {
        ...state,
        pause: action.payload.pause,
      };
    case "CHANGE_STAGE":
      return {
        ...state,
        currentStage: action.payload.currentStage,
        lastPosition: action.payload.lastPosition
          ? action.payload.lastPosition
          : state.lastPosition,
      };
    case "REGISTER_STAGE":
      return {
        ...state,
        stages: { ...state.stages, [action.payload.key]: action.payload.stage },
      };
    case "SIGNED_MESSAGE":
      return {
        ...state,
        isIllegal: action.payload.isIllegal,
        signRejected: action.payload.signRejected,
      };
    case "TOGGLE_MUSIC":
      return {
        ...state,
        track: action.payload,
      };
  }

  return state;
}
