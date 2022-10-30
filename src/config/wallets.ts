import { Wallets } from "./connectors";

export interface Wallet {
  name: string;
  icon: string;
}

export const wallets: Record<Wallets, Wallet> = {
  metamask: {
    name: "Metamask",
    icon: "https://static.gearbox.fi/wallets/metamask.png",
  },
  walletConnect: {
    name: "WalletConnect",
    icon: "https://static.gearbox.fi/wallets/wallet_connect.svg",
  },
};
