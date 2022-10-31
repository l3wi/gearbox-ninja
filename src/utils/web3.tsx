import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BigNumber } from "ethers";

import { BLOCK_UPDATE_DELAY, CHAIN_ID } from "../config";
import {
  walletconnect,
  Wallets,
  walletsToConnectors,
} from "../config/connectors";
import { store } from "../store";
import actions from "../store/actions";

interface EthProvider {
  isCoinbaseWallet?: boolean;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      isCoinbaseWallet?: true;
      on: (...args: Array<any>) => void;
      once: (...args: Array<any>) => void;
      enable: () => Promise<any>;
      removeListener: (...args: Array<any>) => void;
      request: (arg: { method: string; params?: Array<any> }) => Promise<any>;
      autoRefreshOnNetworkChange: boolean;
      networkVersion: string;
      providers: Array<EthProvider>;
      setSelectedProvider: (provider: any) => void;
    };
    web3?: Record<string, unknown>;
    logging?: () => void;
  }
}

// Merges functionality from useSync, useWeb3 & web3-react to manage Metamask & WC

// Connect web3 READ ONLY
export const connect = async () => {
  store.dispatch(actions.web3.connectProvider());
};

// Connect Signer
// 1. Figure out which connector
// 2. Connect Wallet
// 3. Activate Listeners for changes
// X. Throw if errors
export const activate = async (w: Wallets) => {
  store.dispatch(actions.game.AddNotification("Connecting Wallet...", 1000));
  const isInjectedWallet = w === "metamask"; // removed coinbase

  let connector: Web3Provider;
  if (isInjectedWallet) {
    // MM uses propmts prior to provider setup
    await window.ethereum?.enable();
    connector = walletsToConnectors[w];

    if (parseInt(window.ethereum?.networkVersion) !== CHAIN_ID) {
      store.dispatch(
        actions.game.AddNotification("Wrong Network Dectected", 2000),
      );
      try {
        const chainId = "0x" + BigNumber.from(CHAIN_ID).toString();
        window.ethereum.once("chainChanged", async () => {
          await activate(w);
        });
        await window.ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return;
      } catch (error) {
        store.dispatch(
          actions.game.AddNotification("Network Change Failed", 3000),
        );
        return;
      }
    }
  } else {
    // WC uses propmts post to provider setup
    await walletconnect.enable();
    connector = walletsToConnectors[w];
    console.log(connector);
    console.log(await connector.getBlockNumber());
  }
  const { dataCompressor } = store.getState().web3;
  const chainId = CHAIN_ID;

  const isDelared = window.localStorage.getItem("declared");
  if (isDelared) {
    store.dispatch({
      type: "SIGNED_MESSAGE",
      payload: { isIllegal: false },
    });
  } else {
    store.dispatch({
      type: "SIGNED_MESSAGE",
      payload: { isIllegal: true },
    });
  }

  try {
    await store.dispatch(
      actions.web3.connectSigner({
        library: connector,
        dataCompressor,
        chainId,
      }),
    );

    if (window.ethereum && isInjectedWallet) {
      window.ethereum.on("chainChanged", async () => {
        (window.ethereum as any).removeAllListeners("chainChanged");
        store.dispatch(
          actions.game.AddNotification(
            "Network Changed to Wrong Network",
            3000,
          ),
        );
        /// Activate Wallet again and go through wallet flow
        const connectAgain = () => {
          store.dispatch(actions.web3.disconnectSigner());
          setTimeout(async () => {
            await activate(w);
          }, 500);
        };

        if (document.hasFocus()) {
          connectAgain();
        } else {
          let count = 0;
          window.onfocus = function () {
            if (count === 0) {
              connectAgain();
              count++;
            }
          };
        }
      });

      window.ethereum.on("accountsChanged", async () => {
        console.log("Account changed");
        (window.ethereum as any).removeAllListeners("accountsChanged");
        activate(w);
        store.dispatch(actions.web3.setWalletType(w));
      });
    }

    // Set Wallet type
    await store.dispatch(actions.web3.setWalletType(w));
  } catch (eo: any) {
    if (window.ethereum && isInjectedWallet) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
        });

        if (w === "metamask") {
          window.ethereum.once("chainChanged", async () => {
            await activate(w);
          });
        }
      } catch (e: any) {
        console.error("Cant useWeb3" + e);

        // e.code === 4902 - chain not added
        // e.code === -32002 - request already pending
      }
    }

    store.dispatch(actions.web3.setWalletType(undefined));
    store.dispatch(
      actions.game.AddNotification("Unable to connect wallet", 2000),
    );
    console.error("Cant Web3" + eo);
  }
};

export const declare = async () => {
  try {
    await store.dispatch(actions.game.signDeclaration());
    localStorage.setItem("declared", "true");
  } catch (e: any) {
    console.error("Call Gary we have rulebreaker" + e);
  }
};

export const deactivate = async () => {
  store.dispatch(actions.web3.disconnectSigner());
  store.dispatch(actions.web3.setWalletType(undefined));
};

export default { connect, declare, activate, deactivate };
