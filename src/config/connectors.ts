import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { CHAIN_ID, JSON_RPC_PROVIDER } from "../config";

export const injected = new Web3Provider(window?.ethereum);

export const walletconnect = new WalletConnectProvider({
  rpc: { [CHAIN_ID]: JSON_RPC_PROVIDER },
  pollingInterval: 5000,
});

const wcProvider = new Web3Provider(walletconnect);

export const walletsToConnectors = {
  metamask: injected,
  walletConnect: wcProvider,
};

export type Wallets = keyof typeof walletsToConnectors;
