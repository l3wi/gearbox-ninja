/* eslint-disable no-nested-ternary */
import {
  GOERLI_NETWORK,
  MAINNET_NETWORK,
  NetworkType,
} from "@gearbox-protocol/sdk";

export const isDev = process.env.NODE_ENV !== "production";

// app network
export const TEST_NET_ID = GOERLI_NETWORK;
export const CHAIN_ID = parseInt(
  process.env.REACT_APP_CHAIN_ID || `${GOERLI_NETWORK}`,
  10
);
export const IS_TEST_NETWORK = CHAIN_ID === TEST_NET_ID;
export const TESTNET_CHAIN_TYPE: NetworkType = "Goerli";
export const CHAIN_TYPE: NetworkType = IS_TEST_NETWORK
  ? TESTNET_CHAIN_TYPE
  : "Mainnet";

const IS_MAINNET = CHAIN_ID === MAINNET_NETWORK;

// app
export const APP_VERSION = 2;
export const OTHER_APP_VERSION = 1;
export const OTHER_VERSION_ADDRESS = "http://localhost:3000";
export const ANALYTICS_ADDR = isDev
  ? "http://localhost:3002"
  : IS_TEST_NETWORK
  ? "https://charts.goerli.gearbox.fi"
  : "https://charts.gearbox.fi";

export const ETHERSCAN_ADDR = IS_TEST_NETWORK
  ? "https://goerli.etherscan.io"
  : "https://etherscan.io";

// gearbox url
export const DISCORD_ADDR = "https://discord.com/invite/gearbox";
export const LANDING_ADDR = "https://gearbox.fi";
export const DOCS_DOMAIN = "https://docs.gearbox.fi";
export const FAUCET_ADDR =
  process.env.REACT_APP_FAUCET_ADDR || "https://faucet.gearbox.foundation";
export const TEST_APP_ADDR =
  process.env.REACT_APP_TEST_APP_ADDR || "https://app.goerli.gearbox.fi";

export const AUTH_ADDR =
  process.env.REACT_APP_AUTH_ADDR || "https://auth.gearbox.foundation";
export const getAuthUrl = (url: string) => `${AUTH_ADDR}${url}`;

// gearbox contract addresses
export const PATHFINDER = process.env.REACT_APP_PATHFINDER || "";
export const ADDRESS_PROVIDER = process.env.REACT_APP_ADDRESS_PROVIDER || "";
export const MULTICALL_ADDRESS = "0x5ba1e12693dc8f9c48aad8770482f4739beed696";
export const DEGEN_NFT = process.env.REACT_APP_DEGEN_NFT;
export const DEGEN_DISTRIBUTOR = process.env.REACT_APP_DEGEN_DISTRIBUTOR;
export const multiCallConfig = {
  preset: IS_TEST_NETWORK ? "goerli" : "mainnet",
};

// constants
export const REPAY_SURPLUS = 10003;
export const BLOCK_UPDATE_DELAY = 60 * 1000;
export const STRATEGY_UPDATE_DELAY = 60 * 60 * 6 * 1000; // each 6 hours
export const MAX_LEVERAGE_FACTOR_V2 = 900;

export const JSON_RPC_PROVIDER = IS_TEST_NETWORK
  ? process.env.REACT_APP_JSON_RPC_GOERLI
  : IS_MAINNET
  ? process.env.REACT_APP_JSON_RPC_MAINNET
  : process.env.REACT_APP_JSON_RPC_FORK;
