import {
  AwaitedRes,
  callRepeater,
  IERC20,
  IERC20__factory,
  MAX_INT,
  MCall,
  multicall,
  Multicall2,
  Multicall2__factory,
  TokenData,
  TxApprove,
} from "@gearbox-protocol/sdk";
import { Multicall2Interface } from "@gearbox-protocol/sdk/lib/types/@gearbox-protocol/core-v2/contracts/support/MultiCall.sol/Multicall2";
import { BigNumber } from "ethers";

import { CHAIN_ID, MULTICALL_ADDRESS } from "../../config";
import { captureException } from "../../utils/errors";
import actions from "../actions";
import { RootState } from "../index";
import { getError, updateStatus } from "../operations";
import { addPendingTransaction } from "../web3/transactions";
import { getAllowanceId, ThunkTokenAction, TokenAction } from "./index";

type ERC20Interface = IERC20["interface"];

const getTokenContract = async (getState: () => RootState, address: string) => {
  const { signer, account } = getState().web3;
  if (!signer || !account) {
    throw new Error("Cant get signer or account");
  }

  return IERC20__factory.connect(address, signer);
};

export const updateBatchBalances = (
  updatedBalances: Record<string, BigNumber>
): TokenAction => ({
  type: "TOKEN_BATCH_BALANCE_SUCCESS",
  payload: updatedBalances,
});

interface GetTokenAllowanceProps {
  tokenAddress: string;
  to: string;
  account: string;
}

export const getTokenAllowance =
  ({ tokenAddress, to, account }: GetTokenAllowanceProps): ThunkTokenAction =>
  async (dispatch, getState) => {
    const id = getAllowanceId(tokenAddress, to);
    try {
      dispatch({
        type: "TOKEN_ALLOWANCE_SUCCESS",
        payload: { id, allowance: BigNumber.from(0) },
      });

      const { signer } = getState().web3;
      if (!signer) {
        throw new Error("Cant get signer");
      }

      const token = await getTokenContract(getState, tokenAddress);
      const allowance = BigNumber.from(
        await callRepeater(() => token.allowance(account, to))
      );

      dispatch({
        type: "TOKEN_ALLOWANCE_SUCCESS",
        payload: { id, allowance },
      });
      dispatch({ type: "TOKEN_DELETE_VIRTUAL_ALLOWANCE", payload: id });
    } catch (e: any) {
      dispatch({ type: "TOKEN_DELETE_VIRTUAL_ALLOWANCE", payload: id });
      captureException(
        "store/tokens/actions",
        "Cant getTokenAllowance",
        tokenAddress,
        to,
        e
      );
    }
  };

interface ApproveTokenProps {
  tokenAddress: string;
  to: string;
  account: string;
  opHash?: string;
  chainId?: number;
}

export const approveToken =
  ({
    tokenAddress,
    to,
    account,
    opHash,
    chainId = CHAIN_ID,
  }: ApproveTokenProps): ThunkTokenAction =>
  async (dispatch, getState) => {
    const id = getAllowanceId(tokenAddress, to);

    try {
      dispatch(updateStatus(opHash, "STATUS.WAITING"));
      dispatch(actions.game.AddNotification("Waiting for user"));
      const token = await getTokenContract(getState, tokenAddress);
      const receipt = await token.approve(to, MAX_INT);

      dispatch(updateStatus(opHash, "STATUS.LOADING"));
      dispatch(actions.game.AddNotification("Approval Pending", 0));
      dispatch({
        type: "TOKEN_VIRTUAL_ALLOWANCE",
        payload: { id, allowance: MAX_INT },
      });
      await receipt.wait();

      dispatch(updateStatus(opHash, "STATUS.SUCCESS"));
      const evmTx = new TxApprove({
        txHash: receipt.hash,
        token: tokenAddress,
        timestamp: 0,
      });

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getTokenAllowance({ tokenAddress, to, account }));
          },
        })
      );
      dispatch(actions.game.AddNotification("Token Approved", 2000));
    } catch (e: any) {
      dispatch({ type: "TOKEN_DELETE_VIRTUAL_ALLOWANCE", payload: id });
      dispatch(updateStatus(opHash, "STATUS.FAILURE", getError(e)));
      captureException(
        "store/tokens/actions",
        "Cant approveToken",
        tokenAddress,
        to,
        e
      );
    }
  };

interface GetTokenBalancesProps {
  account: string;
  opHash?: string;
}

export const getTokenBalances =
  ({ account }: GetTokenBalancesProps): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      const {
        web3: { provider },
        tokens: { details: tokenList },
      } = getState();
      if (!provider) throw new Error("Provider is undefined");

      const tokenAddresses = Object.keys(tokenList);

      const calls: [
        MCall<Multicall2Interface>,
        ...Array<MCall<ERC20Interface>>
      ] = [
        {
          address: MULTICALL_ADDRESS,
          interface: Multicall2__factory.createInterface(),
          method: "getEthBalance(address)",
          params: [account],
        },
        ...tokenAddresses.map(
          (tokenAddress) =>
            ({
              address: tokenAddress,
              interface: IERC20__factory.createInterface(),
              method: "balanceOf(address)",
              params: [account],
            } as const)
        ),
      ];

      const [ethBalance, ...balanceResult] = await callRepeater(() =>
        multicall<
          [
            AwaitedRes<Multicall2["getEthBalance"]>,
            ...Array<AwaitedRes<IERC20["balanceOf"]>>
          ]
        >(calls, provider)
      );

      dispatch({ type: "WEB3_BALANCE_SUCCESS", payload: ethBalance });

      const balances = balanceResult.reduce<Record<string, BigNumber>>(
        (acc, b, num) => {
          acc[tokenAddresses[num]] = b;
          return acc;
        },
        {}
      );

      dispatch(updateBatchBalances(balances));
    } catch (e: any) {
      captureException("store/tokens/actions", "Cant getTokenBalances", e);
    }
  };

interface GetTokenBalanceProps {
  address: string;
  opHash?: string;
}

export const getTokenBalance =
  ({ address: tokenAddress, opHash }: GetTokenBalanceProps): ThunkTokenAction =>
  async (dispatch, getState) => {
    const tokenAddressLc = tokenAddress.toLowerCase();

    try {
      const { signer, account } = getState().web3;
      if (!signer || !account) {
        throw new Error("Cant get signer or account");
      }

      const token = await getTokenContract(getState, tokenAddressLc);
      const balance = BigNumber.from(
        await callRepeater(() => token.connect(signer).balanceOf(account))
      );

      dispatch({
        type: "TOKEN_BALANCE_SUCCESS",
        payload: { id: tokenAddressLc, balance },
      });
      dispatch(updateStatus(opHash, "STATUS.SUCCESS"));
    } catch (e: any) {
      dispatch(updateStatus(opHash, "STATUS.FAILURE", getError(e)));
      captureException(
        "store/tokens/actions",
        "Cant getTokenBalance",
        tokenAddressLc,
        e
      );
    }
  };

export const getTokenAllowances =
  (
    tokensList: Record<string, TokenData>,
    to: string,
    account: string
  ): ThunkTokenAction =>
  async (dispatch, getState) => {
    try {
      const { signer } = getState().web3;
      if (!signer) {
        throw new Error("Cant get signer");
      }

      const tokenAddresses = Object.keys(tokensList);

      const calls: Array<MCall<ERC20Interface>> = tokenAddresses.map(
        (address) => ({
          address,
          interface: IERC20__factory.createInterface(),
          method: "allowance(address,address)",
          params: [account, to],
        })
      );

      const allowanceBNs = await callRepeater(() =>
        multicall<Array<AwaitedRes<IERC20["allowance"]>>>(
          calls,
          signer.provider!
        )
      );

      const allowances = tokenAddresses.reduce<Record<string, BigNumber>>(
        (acc, tokenAddress, index) => {
          const bn = allowanceBNs[index];
          const id = getAllowanceId(tokenAddress, to);
          acc[id] = bn || BigNumber.from(0);
          return acc;
        },
        {}
      );

      dispatch({
        type: "TOKEN_ALLOWANCE_BATCH_SUCCESS",
        payload: allowances,
      });
    } catch (e: any) {
      captureException(
        "store/tokens/actions",
        "Cant getTokenAllowances",
        account,
        to,
        e
      );
    }
  };

export const clearBalancesAllowances = (): TokenAction => ({
  type: "TOKEN_BALANCES_ALLOWANCES_CLEAR",
});
