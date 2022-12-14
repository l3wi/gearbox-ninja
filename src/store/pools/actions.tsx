import {
  callRepeater,
  NetworkError,
  PoolData,
  PoolDataPayload,
  TxAddLiquidity,
  TxRemoveLiquidity,
} from "@gearbox-protocol/sdk";
import { BigNumber, ContractTransaction } from "ethers";

import { CHAIN_ID } from "../../config";
import { WSTETH_ADDRESS } from "../../config/tokens";
import actions from "../actions";
import { getError, updateStatus } from "../operations";
import { ThunkTokenAction } from "../tokens";
import {
  getSignerOrThrow,
  getWETHGatewayOrThrow,
  getWSTETHGatewayOrThrow,
} from "../web3";
import { addPendingTransaction } from "../web3/transactions";
import { PoolThunkAction } from ".";

export const getList = (): PoolThunkAction => async (dispatch, getState) => {
  try {
    const { dataCompressor, account } = getState().web3;

    if (!dataCompressor) {
      throw new Error("No account selected!");
    }

    const poolsPayload: Array<PoolDataPayload> = await callRepeater(() =>
      dataCompressor.getPoolsList(),
    );

    const result: Record<string, PoolData> = {};

    for (let p of poolsPayload) {
      result[p.addr.toLowerCase()] = new PoolData(p);
      if (account)
        dispatch(
          actions.tokens.getTokenAllowance({
            tokenAddress: p.underlying,
            to: p.addr,
            account,
          }),
        );
    }

    dispatch({
      type: "POOL_LIST_SUCCESS",
      payload: result,
    });
  } catch (e: any) {
    dispatch({
      type: "POOL_LIST_FAILURE",
      payload: new NetworkError(),
    });
    console.error("store/pools/actions", "Pools: cant getList", e);
  }
};

function gasLimit(gas: BigNumber) {
  return gas.mul(12).div(10);
}

export interface AddLiquidityProps {
  pool: PoolData;
  ethAmount: BigNumber;
  amount: BigNumber;
  opHash?: string;
  chainId?: number;
}

export const addLiquidity =
  ({
    pool,
    amount,
    ethAmount,
    opHash,
    chainId = CHAIN_ID,
  }: AddLiquidityProps): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      const referralCode = 0;
      dispatch(updateStatus(opHash, "STATUS.WAITING"));
      const signer = getSignerOrThrow(getState);
      const signerAddress = await signer.getAddress();

      let receipt: ContractTransaction;
      dispatch(actions.game.AddNotification("Waiting for user"));

      if (pool.isWETH && ethAmount.gt(0)) {
        const wethGateway = getWETHGatewayOrThrow(getState);
        receipt = await wethGateway
          .connect(signer)
          .addLiquidityETH(pool.address, signerAddress, 0, {
            value: ethAmount,
          });
        dispatch(actions.operations.updateStatus(opHash, "STATUS.LOADING"));
        dispatch(actions.game.AddNotification("Deposit Pending", 0));
      } else if (pool.underlyingToken === WSTETH_ADDRESS && ethAmount.gt(0)) {
        const wstethGateway = getWSTETHGatewayOrThrow(getState);
        const withSigner = wstethGateway.connect(signer);
        const gas = await withSigner.estimateGas.addLiquidity(
          amount,
          signerAddress,
          referralCode,
        );

        receipt = await withSigner.addLiquidity(
          amount,
          signerAddress,
          referralCode,
          {
            gasLimit: gasLimit(gas),
          },
        );
        dispatch(updateStatus(opHash, "STATUS.LOADING"));
      } else {
        const tx = await pool
          .getContractETH(signer)
          .populateTransaction.addLiquidity(amount, signerAddress, 0);

        dispatch(updateStatus(opHash, "STATUS.LOADING"));
        receipt = await signer.sendTransaction(tx);
      }

      dispatch(
        addPendingTransaction({
          chainId,
          tx: new TxAddLiquidity({
            txHash: receipt.hash,
            amount,
            underlyingToken: pool.underlyingToken,
            pool: pool.address,
            timestamp: 0,
          }),
          callback: () => dispatch(getList()),
        }),
      );
      await receipt.wait();

      dispatch(actions.game.AddNotification("Deposit successful!"));
      dispatch(updateStatus(opHash, "STATUS.SUCCESS"));
    } catch (e: any) {
      dispatch(
        actions.operations.updateStatus(opHash, "STATUS.FAILURE", getError(e)),
      );
      dispatch(actions.game.AddNotification("Deposit failed!"));

      console.error(
        "store/pools/actions",
        "Cant addLiquidity",
        pool.address,
        amount.toString(),
        e,
      );
    }
  };

export const removeLiquidity =
  (
    pool: PoolData,
    amount: BigNumber,
    opHash?: string,
    chainId = CHAIN_ID,
  ): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      dispatch(actions.operations.updateStatus(opHash, "STATUS.WAITING"));
      const signer = getSignerOrThrow(getState);
      const signerAddress = await signer.getAddress();

      if (pool.isWETH) {
        const wethGateway = getWETHGatewayOrThrow(getState);

        const signerAddress = await signer.getAddress();

        const receipt = await wethGateway
          .connect(signer)
          .removeLiquidityETH(pool.address, amount, signerAddress);
        dispatch(actions.operations.updateStatus(opHash, "STATUS.LOADING"));
        await receipt.wait();
      } else {
        const receipt = await pool
          .getContractETH(signer)
          .connect(signer)
          .removeLiquidity(amount, signerAddress);
        dispatch(actions.operations.updateStatus(opHash, "STATUS.LOADING"));

        // Add transaction to wait list
        dispatch(
          addPendingTransaction({
            chainId,
            tx: new TxAddLiquidity({
              txHash: receipt.hash,
              amount,
              underlyingToken: pool.underlyingToken,
              pool: pool.address,
              timestamp: 0,
            }),
            callback: () => dispatch(getList()),
          }),
        );
      }
      dispatch(actions.operations.updateStatus(opHash, "STATUS.SUCCESS"));
    } catch (e: any) {
      dispatch(
        actions.operations.updateStatus(opHash, "STATUS.FAILURE", getError(e)),
      );
      console.error(
        "store/pools/actions",
        "Cant removeLiquidity",
        pool.address,
        amount.toString(),
        e,
      );
    }
  };
