import {
  CreditManagerData,
  formatLeverage,
  LEVERAGE_DECIMALS,
  Strategy,
  TokenData,
} from "@gearbox-protocol/sdk";
import { BigNumber, BigNumberish, utils } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { ApproveButton } from "../../components/approvalButton";
import { ErrorButtonGuard } from "../../components/errorButton";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../config/constants";
import { unwrapTokenAddress } from "../../config/tokens";
import {
  useAssets,
  useSingleAsset,
  useSumAssets,
  useWrapETH,
} from "../../hooks/useAssets";
import { useOverallAPY } from "../../hooks/useCreditAccounts";
import { useAllowedTokensWithETH } from "../../hooks/useCreditManagers";
import { useHF } from "../../hooks/useHF";
import {
  useLeveragedAmount,
  useTotalAmountInTarget,
} from "../../hooks/useOpenAccount";
import { usePrices } from "../../hooks/usePrices";
import {
  useAPYList,
  useMaxLeverage,
  useOpenStrategy,
} from "../../hooks/useStrategy";
import {
  useTokenBalances,
  useTokensDataListWithETH,
} from "../../hooks/useTokens";
import { useValidateOpenStrategy } from "../../hooks/useValidate";
import { RootState } from "../../store";
import actions from "../../store/actions";
import { isNumeric, nFormatter } from "../../utils/format";
import { generateNewHash } from "../../utils/opHash";
import Picker from "./picker";
import Slider from "./slider";

interface Props {
  strategy: Strategy;
  creditManager: CreditManagerData;
  balances: Record<string, BigNumberish>;
  tokensList: Record<string, TokenData>;
  pools: string[];
  poolChange: (address: string) => void;
}

const OpenStrategyDialog: React.FC<Props> = ({
  strategy,
  creditManager,
  balances,
  tokensList,
  pools,
  poolChange,
}) => {
  const dispatch = useDispatch();
  const { balance, nftBalance } = useSelector((state: RootState) => state.web3);
  const prices = usePrices();

  const { underlyingToken: cmUnderlyingToken } = creditManager || {};
  const allowedTokens = useAllowedTokensWithETH(creditManager);
  const collateralAssetsState = useAssets([
    {
      balance: BigNumber.from(0),
      balanceView: "",
      token: unwrapTokenAddress(cmUnderlyingToken),
    },
  ]);

  const maxLeverage =
    useMaxLeverage(strategy.lpToken.toLowerCase(), creditManager) +
    LEVERAGE_DECIMALS;

  const {
    address: cmAddress,
    borrowRate,
    minAmount,
    maxAmount,
    underlyingToken: underlyingTokenAddress,
    liquidationThresholds,
  } = creditManager;
  const { lpToken: lpTokenAddress, apy, baseAssets } = strategy;

  const underlyingToken = tokensList[underlyingTokenAddress];

  const lpToken = tokensList[lpTokenAddress];
  const { symbol: lpSymbol = "" } = lpToken || {};

  const {
    assets: unwrappedCollateral,
    handlers: { handleAdd, handleChangeAmount, handleRemove },
  } = collateralAssetsState;

  const [wrappedCollateral, ethAmount] = useWrapETH(unwrappedCollateral);

  const maxLeverageFactor = useMaxLeverage(lpTokenAddress, creditManager);
  const [leverage, setLeverage] = useState(
    maxLeverageFactor + LEVERAGE_DECIMALS,
  );
  const totalAmount = useTotalAmountInTarget({
    assets: wrappedCollateral,
    prices,
    targetToken: underlyingToken,
    tokensList,
  });

  const [amountOnAccount, borrowedAmount] = useLeveragedAmount(
    totalAmount,
    leverage,
  );

  const borrowedAsset = useSingleAsset(underlyingTokenAddress, borrowedAmount);
  const collateralAndBorrow = useSumAssets(wrappedCollateral, borrowedAsset);

  const strategyPath = useOpenStrategy(
    creditManager,
    collateralAndBorrow,
    lpTokenAddress,
  );

  const unsafeAssetsAfterOpen = strategyPath?.balances;
  const assetsAfterOpen = unsafeAssetsAfterOpen || EMPTY_ARRAY;

  const hfFrom =
    useHF({
      assets: assetsAfterOpen,
      prices,
      liquidationThresholds,
      underlyingToken: underlyingTokenAddress,
      borrowed: borrowedAmount,
    }) || 0;

  const errString = useValidateOpenStrategy({
    balances: { ...balances, "0x0": BigNumber.from(balance) },
    assets: unwrappedCollateral,
    tokensList,
    cm: creditManager,
    amount: totalAmount,
    debt: borrowedAmount,

    strategyPath,

    hf: hfFrom,
  });

  const apyList = useAPYList();
  const overallAPYFrom =
    useOverallAPY({
      caAssets: assetsAfterOpen,
      lpAPY: apyList,
      prices,

      totalValue: amountOnAccount,
      debt: borrowedAmount,
      borrowRate,
      underlyingToken: underlyingTokenAddress,
    }) || 0;

  const lpAmount = useMemo(() => {
    return (
      assetsAfterOpen.find(({ token }) => token === lpTokenAddress)?.balance ||
      BigNumber.from(0)
    );
  }, [lpTokenAddress, assetsAfterOpen]);

  const allAssetsSelected = allowedTokens.length === wrappedCollateral.length;
  const apyLoading = !unsafeAssetsAfterOpen || apy === undefined;

  const handleSubmit = () => {
    if (nftBalance === 0)
      return dispatch(
        actions.game.AddNotification("You have used all you DEGEN NFTs!", 2000),
      );

    const opHash = generateNewHash("OAS-ACT-");
    dispatch(
      actions.strategy.openStrategy({
        creditManager,
        strategyPath,
        wrappedCollateral,
        borrowedAmount,
        ethAmount,
        opHash,
      }),
    );
  };

  // index 0
  const updateValue = (index: number, input: BigNumberish) => {
    const func = handleChangeAmount(index);
    const token = tokensList[unwrappedCollateral[index].token];
    if (isNumeric(input) && typeof input === "string") {
      const bn = utils.parseUnits(input, token.decimals);
      return func(bn, input.toString());
    }
    if (input instanceof BigNumber) {
      return func(
        input,
        input
          .div(
            BigNumber.from(10).pow(
              tokensList[unwrappedCollateral[index].token].decimals,
            ),
          )
          .toString(),
      );
    }
    return func(unwrappedCollateral[index].balance, input.toString());
  };

  return (
    <Row>
      <FormContainer>
        <h3>Deposit Assets</h3>
        {unwrappedCollateral.map((collateral, i) => {
          const rm = handleRemove(i);
          return (
            <Section>
              <InputSuper>
                <span>
                  {`BALANCE: 
                        ${nFormatter(
                          balances[collateral.token],
                          tokensList[collateral.token]
                            ? tokensList[collateral.token].decimals
                            : 18,
                          3,
                        )} 
                        ${
                          tokensList[collateral.token] &&
                          tokensList[collateral.token].symbol.toUpperCase()
                        }`}
                </span>
                {unwrappedCollateral.length != 1 && (
                  <RmItem onClick={() => rm()}>x</RmItem>
                )}
              </InputSuper>
              <InputGroup>
                <Input
                  placeholder="0.0"
                  value={collateral.balanceView}
                  onChange={e => updateValue(i, e.target.value)}
                />

                <Asset>
                  <>
                    <img width={20} src={tokensList[collateral.token].icon} />
                    <span>
                      {tokensList[collateral.token].symbol.toUpperCase()}
                    </span>
                  </>
                </Asset>
                <MaxButton
                  onClick={() =>
                    updateValue(i, BigNumber.from(balances[collateral.token]))
                  }
                >
                  max
                </MaxButton>
              </InputGroup>
            </Section>
          );
        })}

        <Group>
          <Picker
            selected={unwrappedCollateral}
            tokensList={tokensList}
            balances={balances}
            allowedTokens={allowedTokens}
            func={handleAdd}
          >
            <>
              {!allAssetsSelected && 3 > unwrappedCollateral.length ? (
                <PickerButton>add asset</PickerButton>
              ) : null}
            </>
          </Picker>
        </Group>
        <Group>
          <Picker
            tokensList={tokensList}
            allowedTokens={pools}
            func={poolChange}
          >
            <span>Borrowed Asset: </span>
            <Asset>
              <img width={25} src={underlyingToken.icon} />
              <span>{underlyingToken.symbol.toUpperCase()}</span>
            </Asset>
          </Picker>
        </Group>
      </FormContainer>
      <FormContainer>
        <h3>Leverage</h3>
        <Group>
          <Slider
            amount={totalAmount}
            minAmount={minAmount}
            maxAmount={maxAmount}
            leverage={leverage}
            maxLeverage={maxLeverageFactor}
            setLeverage={setLeverage}
          />
        </Group>
        <Group>
          <span>Health Factor</span>
          <span>{hfFrom / 10000}</span>
        </Group>
        <Group>
          <span>You'll recieve</span>
          <span>{`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          }).format(
            parseFloat(
              lpAmount
                .div(BigNumber.from("10").pow(BigNumber.from(18)))
                .toString(),
            ),
          )} ${lpSymbol.toUpperCase()}`}</span>
        </Group>
        <Group>
          <span>Strategy APY</span>
          <span>{overallAPYFrom}%</span>
        </Group>

        <ButtonGroup>
          {nftBalance === 0 ? (
            <ExecuteButton>
              <>{`You've used all your NFTs`}</>
            </ExecuteButton>
          ) : (
            <ErrorButtonGuard errorString={errString}>
              <ApproveButton
                assets={wrappedCollateral}
                to={creditManager.address}
                skipApprovalsFor={EMPTY_OBJECT}
              >
                <ExecuteButton onClick={() => handleSubmit()}>
                  <>{`Open a  ${formatLeverage(
                    leverage,
                    2,
                  )}x position with ${lpSymbol}`}</>
                </ExecuteButton>
              </ApproveButton>
            </ErrorButtonGuard>
          )}
        </ButtonGroup>
      </FormContainer>
    </Row>
  );
};

const ButtonGroup = styled.div`
  padding: 10px 0px;
`;

const Group = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
  width: 100%;
`;

const RmItem = styled.button`
  outline: none;
  border: none;
  background: none;
  font-family: "Press Start 2P";
  color: white;
  font-size: 15px;
`;

const PickerButton = styled.button`
  width: 100%;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  padding: 15px 8px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 15px;
  margin: 0px;
  font-family: "Press Start 2P";
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: 0.1s ease-in-out;
  &:hover {
    border: 2px solid rgba(255, 255, 255, 1);
    color: rgba(255, 255, 255, 1);
  }
`;

const Section = styled.div`
  padding: 10px 0px;
`;

const InputSuper = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 2px solid white;
  /* padding: 3px 2px; */
  box-sizing: border-box;
  height: 45px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  color: white;
  width: 180px;
  padding: 5px 8px 0px;
  font-size: 18px;
`;

const MaxButton = styled.div`
  background: transparent;
  color: white;
  border: none;
  font-size: 18px;
  padding: 4px 6px;
  text-align: center;
  font-family: "Press Start 2P";
  border-left: 2px solid white;
  display: flex;
  align-items: center;
`;

const FormContainer = styled.div`
  font-size: 18px;
  width: 100%;
  min-width: 400px;
  max-width: 400px;
  padding: 10px 20px;
`;

const ExecuteButton = styled.button`
  width: 100%;
  background: gray;
  border: none;
  color: white;
  padding: 15px 8px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0px;
  line-height: 20px;
  font-family: "Press Start 2P";
`;

const Asset = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0px 6px;
  min-width: 70px;
  height: 45px;
  width: 70px;
`;
const Row = styled.span`
  display: flex;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.4);
`;

function useLiquidationAssets(
  assets: Array<string>,
  underlyingToken: string,
  tokensList: Record<string, TokenData>,
): Array<string> {
  const liquidationAssets = useMemo(
    () =>
      assets
        .filter(address => address !== underlyingToken)
        .map(address => {
          const { symbol } = tokensList[address] || {};

          return symbol;
        })
        .filter(symbol => symbol),
    [assets, underlyingToken, tokensList],
  );
  return liquidationAssets;
}

export default OpenStrategyDialog;
