import { EventOrTx } from "@gearbox-protocol/sdk/";
import { ThunkAction } from "redux-thunk";

import { RootState } from "../index";
import { OperationActions } from "../operations";
import { TokenAction } from "../tokens";
import { Web3Actions } from "../web3";

export type SyncActions =
  | {
      type: "SYNC_LASTBLOCK";
      payload: number;
    }
  | {
      type: "EVENT_UPDATE";
      payload: {
        account: string;
        events: Record<string, EventOrTx>;
        poolSync?: number;
        creditManagerSync?: number;
      };
    };

export type SyncThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  SyncActions | OperationActions | Web3Actions | TokenAction
>;

export const eventsSelector =
  (account = "") =>
  (state: RootState) =>
    state.sync.events[account];

export const syncSelector = (state: RootState) => state.sync;
