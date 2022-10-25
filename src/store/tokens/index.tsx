import { TokenAllowance, TokenBalance, TokenData } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import type { RootState } from "../index";
import { OperationActions } from "../operations";
import type { Web3Actions } from "../web3";

export type TokenAction =
  | {
      type: "TOKEN_BALANCE_SUCCESS";
      payload: TokenBalance;
    }
  | {
      type: "TOKEN_BATCH_BALANCE_SUCCESS";
      payload: Record<string, BigNumber>;
    }
  | {
      type: "TOKEN_BALANCES_ALLOWANCES_CLEAR";
    }
  | {
      type: "TOKEN_ALLOWANCE_SUCCESS";
      payload: TokenAllowance;
    }
  | {
      type: "TOKEN_ALLOWANCE_BATCH_SUCCESS";
      payload: Record<string, BigNumber>;
    }
  | {
      type: "TOKEN_VIRTUAL_ALLOWANCE";
      payload: TokenAllowance;
    }
  | {
      type: "TOKEN_DELETE_VIRTUAL_ALLOWANCE";
      payload: string;
    };

export type ThunkTokenAction = ThunkAction<
  void,
  RootState,
  unknown,
  TokenAction | Web3Actions | OperationActions | AnyAction
>;

export const tokenDataMapSelector = (state: RootState) => state.tokens.details;

export const tokenBalancesSelector = (state: RootState) =>
  state.tokens.balances;
export const tokenBalanceSelector = (address: string) => (state: RootState) =>
  state.tokens.balances[address.toLowerCase()];

export const getAllowanceId = (tokenAddress: string, to: string) =>
  `${tokenAddress.toLowerCase()}@${to.toLowerCase()}`;

export const allowancesSelector = () => (state: RootState) =>
  state.tokens.allowances;
export const tokenAllowanceSelector =
  (address: string, to: string) => (state: RootState) =>
    state.tokens.allowances[getAllowanceId(address, to)];

export const virtualTokenAllowancesSelector = () => (state: RootState) =>
  state.tokens.virtualAllowances;
export const virtualTokenAllowanceSelector =
  (address: string, to: string) => (state: RootState) =>
    state.tokens.virtualAllowances[getAllowanceId(address, to)];
