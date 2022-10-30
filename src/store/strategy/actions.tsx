import {
  Asset,
  CreditManagerData,
  getNetworkType,
  ICreditFacade__factory,
  isTokenWithAPY,
  LPTokenDataI,
  LPTokens,
  LpTokensAPY,
  PRICE_DECIMALS,
  Strategy,
  tokenSymbolByAddress,
  TxOpenMultitokenAccount,
} from "@gearbox-protocol/sdk";
import { BigNumber, ethers } from "ethers";

import { CHAIN_ID } from "../../config";
import { strategiesPayload } from "../../config/strategy";
import { captureException } from "../../utils/errors";
import { generateNewHash } from "../../utils/opHash";
import actions from "../actions";
import {
  getByCreditManager,
  getList as caGetList,
  openInProgressByCreditManager,
  removeOpenInProgressByCreditManager,
} from "../creditAccounts/actions";
import { getError, updateStatus } from "../operations";
import { getTokenBalances } from "../tokens/actions";
import { getSignerOrThrow } from "../web3";
import { addPendingTransaction } from "../web3/transactions";
import {
  getAPYValue,
  getConvexAPY,
  getCurveAPY,
  getLidoAPY,
  getYearnAPY,
} from "./apy";
import { StrategyAction, StrategyPath, StrategyThunkAction } from "./index";

const memoProvidePrice =
  (prices: Record<string, BigNumber>) =>
  (t = "") => {
    const price = prices[t?.toLowerCase()];
    return price || PRICE_DECIMALS;
  };

export const getApy =
  (
    provider: ethers.providers.JsonRpcProvider,
    prices: Record<string, BigNumber>,
    lpTokensDataList: Record<string, LPTokenDataI>,
  ): StrategyThunkAction =>
  async dispatch => {
    try {
      const networkType = getNetworkType(CHAIN_ID);
      const providePrice = memoProvidePrice(prices);

      const [crv, originalCrv] = await getCurveAPY();

      const [cvx, ldo, yearn] = await Promise.all([
        getConvexAPY({
          provider,
          networkType,
          getTokenPrice: providePrice,
          curveAPY: originalCrv,
        }),
        getLidoAPY(provider, networkType),
        getYearnAPY(),
      ]);

      const lpTokenAPY = Object.values(lpTokensDataList).reduce(
        (acc, tokenDetails) => {
          const { symbol } = tokenDetails;

          acc[symbol] = getAPYValue(tokenDetails, { crv, cvx, yearn });
          return acc;
        },
        {} as Record<LPTokens, number>,
      );

      dispatch({
        type: "SET_APY_BULK",
        payload: { ...lpTokenAPY, STETH: ldo },
      });
    } catch (e: any) {
      captureException("store/strategy/actions", "Cant getApy", e);
    }
  };

export const getStrategies =
  (apys: LpTokensAPY): StrategyThunkAction =>
  async dispatch => {
    try {
      const strategies = strategiesPayload.reduce<Record<string, Strategy>>(
        (acc, payload) => {
          const symbol = tokenSymbolByAddress[payload.lpToken];
          if (!isTokenWithAPY(symbol)) {
            console.error(
              `Strategy LP token has no apy: ${payload.lpToken} ${symbol}`,
            );
            return acc;
          }

          acc[payload.lpToken] = new Strategy({
            ...payload,
            apy: apys[symbol] || 0,
          });
          return acc;
        },
        {},
      );

      dispatch({
        type: "SET_STRATEGY_BULK",
        payload: strategies,
      });
    } catch (e: any) {
      captureException("store/pice/actions", "Cant getStrategies", e);
    }
  };

export const clearOpenStrategyPath = (): StrategyAction => ({
  type: "CLEAR_STRATEGY_OPEN_PATH",
});

interface GetOpenStrategyPathProps {
  creditManager: CreditManagerData;
  targetTokenAddress: string;
  assets: Array<Asset>;
  slippage: number;
}

export const getOpenStrategyPath =
  ({
    creditManager,
    assets,
    targetTokenAddress,
    slippage,
  }: GetOpenStrategyPathProps): StrategyThunkAction =>
  async (dispatch, getState) => {
    const openId = generateNewHash("");
    try {
      const {
        web3: { pathFinder },
      } = getState();
      if (!pathFinder) throw new Error("pathfinder is undefined");

      dispatch({ type: "UPDATE_STRATEGY_OPEN_ID", payload: openId });

      const record = assets.reduce<Record<string, BigNumber>>((acc, asset) => {
        acc[asset.token] = asset.balance;
        return acc;
      }, {});

      const { balances, calls } = await pathFinder.findOpenStrategyPath(
        creditManager,
        record,
        targetTokenAddress,
        slippage,
      );

      const resultAssets = Object.entries(balances).reduce<Array<Asset>>(
        (acc, [token, balance]) => {
          acc.push({ token, balance });
          return acc;
        },
        [],
      );

      dispatch({
        type: "SET_STRATEGY_OPEN_PATH",
        payload: {
          strategyPath: {
            balances: resultAssets,
            calls,
          },
          openId,
        },
      });
    } catch (e: any) {
      captureException("store/strategy/actions", "Cant getOpenStrategyPath", e);
      dispatch({
        type: "STRATEGY_OPEN_PATH_NOT_FOUND",
        payload: openId,
      });
    }
  };

export interface OpenStrategyProps {
  creditManager: CreditManagerData;
  strategyPath: StrategyPath;
  wrappedCollateral: Array<Asset>;
  borrowedAmount: BigNumber;
  ethAmount: BigNumber;
  opHash: string;
  chainId?: number;
}

export const openStrategy =
  ({
    creditManager,
    strategyPath,
    wrappedCollateral,
    borrowedAmount,
    ethAmount,
    opHash = "0",
    chainId = CHAIN_ID,
  }: OpenStrategyProps): StrategyThunkAction =>
  async (dispatch, getState) => {
    try {
      dispatch(updateStatus(opHash, "STATUS.WAITING"));
      dispatch(actions.game.AddNotification("Waiting for approval", 2000));

      const signer = getSignerOrThrow(getState);
      const {
        address: creditManagerAddress,
        underlyingToken,
        creditFacade: creditFacadeAddress,
      } = creditManager;
      const creditFacade = ICreditFacade__factory.connect(
        creditFacadeAddress,
        signer,
      );
      const account = await signer.getAddress();

      const collateralCalls = wrappedCollateral.map(
        ({ token: tokenAddress, balance: amount }) =>
          creditManager.encodeAddCollateral(account, tokenAddress, amount),
      );

      const receipt = await creditFacade.openCreditAccountMulticall(
        borrowedAmount,
        account,
        [...collateralCalls, ...strategyPath.calls],
        0,
        { value: ethAmount },
      );

      dispatch(openInProgressByCreditManager(creditManagerAddress));

      const evmTx = new TxOpenMultitokenAccount({
        txHash: receipt.hash,
        creditManager: creditManagerAddress,
        timestamp: receipt.timestamp || 0,
        borrowedAmount,
        underlyingToken,
        assets: strategyPath.balances
          .filter(({ balance }) => balance.gt(1))
          .map(({ token: tokenAddress }) => tokenAddress),
      });
      dispatch(actions.game.AddNotification("Deploying Strategy...."));

      dispatch(
        addPendingTransaction({
          chainId,
          tx: evmTx,
          callback: () => {
            dispatch(getByCreditManager(creditManagerAddress, account));

            dispatch(caGetList());
            dispatch(removeOpenInProgressByCreditManager(creditManagerAddress));
            dispatch(getTokenBalances({ account }));
            dispatch(updateStatus(opHash, "STATUS.SUCCESS"));
            dispatch(
              actions.game.AddNotification(
                "Strategy successfully opened!",
                2000,
              ),
            );
          },
        }),
      );
    } catch (e: any) {
      dispatch(updateStatus(opHash, "STATUS.FAILURE", getError(e)));
      captureException("store/strategy/actions", "Cant openStrategy", e);
      dispatch(actions.game.AddNotification("Deploying Strategy Failed", 2000));
    }
  };
