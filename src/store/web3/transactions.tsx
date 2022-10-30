import { EVMTx, TxSerializer } from "@gearbox-protocol/sdk";
import { providers } from "ethers";

import { ETHERSCAN_ADDR } from "../../config";
import { ThunkWeb3Action } from "./index";

interface RemoveTxProps {
  account: string;
  chainId: number;
  txHash: string;
}

export const removeTransactionFromList =
  ({ account, chainId, txHash }: RemoveTxProps): ThunkWeb3Action =>
  async (dispatch, getState) => {
    const { transactions } = getState().web3;

    const accTxs = transactions[account] || [];
    const txs = accTxs.filter(
      (tx) => tx.txHash.toLowerCase() !== txHash.toLowerCase()
    );

    if (txs.length !== accTxs.length) {
      localStorage.setItem(
        `txs_${chainId}_${account.toLowerCase()}`,
        TxSerializer.serialize(txs)
      );
      dispatch({
        type: "UPDATE_ALL_TX",
        payload: { account, txs },
      });
    }
  };

interface RestoreTxProps {
  account: string;
  chainId: number;
  provider: providers.Web3Provider;
}

export const restoreTransactions =
  ({ account, chainId, provider }: RestoreTxProps): ThunkWeb3Action =>
  async (dispatch) => {
    const storedTxs = localStorage.getItem(
      `txs_${chainId}_${account.toLowerCase()}`
    );
    if (storedTxs !== null) {
      const txs = TxSerializer.deserialize(storedTxs);

      const awaitedTxes = await Promise.all(
        txs.map(async (tx) => {
          const txFromChain = await provider.getTransactionReceipt(tx.txHash);

          if (txFromChain) {
            if (txFromChain.logs.length > 0) {
              tx.success(txFromChain.blockNumber);
            } else {
              tx.revert(txFromChain.blockNumber);
            }
          } else {
            tx.revert(0);
          }

          return tx;
        })
      );

      dispatch({
        type: "UPDATE_ALL_TX",
        payload: { account, txs: awaitedTxes },
      });
    }
  };

export const clearPendingTransactions =
  (): ThunkWeb3Action => async (dispatch, getState) => {
    const { account } = getState().web3;
    if (account)
      dispatch({ type: "UPDATE_ALL_TX", payload: { account, txs: [] } });
  };

interface PendingTxProps {
  tx: EVMTx;
  callback: () => void;
  chainId: number;
}

export const addPendingTransaction =
  ({ tx, callback, chainId }: PendingTxProps): ThunkWeb3Action =>
  async (dispatch, getState) => {
    const { provider, account, transactions } = getState().web3;

    if (!provider || !account) throw new Error("Prov is empty");

    const txForSaving = [...(transactions[account] || []), tx];

    dispatch({
      type: "UPSERT_PENDING_TX",
      payload: { account, tx },
    });

    localStorage.setItem(
      `txs_${chainId}_${account.toLowerCase()}`,
      TxSerializer.serialize(txForSaving)
    );

    const receipt = await provider.waitForTransaction(tx.txHash);
    callback();

    const txFromChain = await provider.getTransactionReceipt(
      receipt.transactionHash
    );

    const tokens = getState().tokens.details;

    if (txFromChain.blockNumber) {
      if (txFromChain.logs.length > 0) {
        tx.success(txFromChain.blockNumber);
        // toast.success(tx.toString(tokens), {
        //   style: { background: '#111927', color: 'white' },
        //   onClick: () => openInNewWindow(`${ETHERSCAN_ADDR}/tx/${tx.txHash}`),
        //   autoClose: 7500
        // })
      } else {
        tx.revert(txFromChain.blockNumber);
        // toast.error(tx.toString(tokens), {
        //   style: { background: '#111927', color: 'white' },
        //   onClick: () => openInNewWindow(`${ETHERSCAN_ADDR}/tx/${tx.txHash}`),
        //   autoClose: 12500
        // })
      }
      dispatch({
        type: "UPSERT_PENDING_TX",
        payload: { account, tx },
      });
    }
  };
