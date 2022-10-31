import { getPoolTokens, PoolData, TokenData } from "@gearbox-protocol/sdk";
import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { SufficientAmountGuard } from "../../components/amountButton";
import { ApproveButton } from "../../components/approvalButton";
import ExitButton from "../../components/exitButton";
import {
  currentTokenData,
  unwrapTokenAddress,
  WSTETH_ADDRESS,
} from "../../config/tokens";
import { useAssets, useWrapETH } from "../../hooks/useAssets";
import { usePool, usePoolAPY, usePools } from "../../hooks/usePools";
import { usePrices } from "../../hooks/usePrices";
import {
  useTokenBalances,
  useTokensDataListWithETH,
} from "../../hooks/useTokens";
import { store } from "../../store";
import actions from "../../store/actions";
import { usePoolAllowedTokens } from "../../hooks/usePools";
import { RootState } from "../../store/reducer";
import { bnToFloat, isNumeric, nFormatter } from "../../utils/format";
import { generateNewHash } from "../../utils/opHash";

const depositLPDescription = `Deposit your assets to Gearbox 
protocol to earn yield. These assets will be lent out to Gearbox's 
Credit Accounts who pay a rate to borrow them. Deposit your assets 
and become a ninja today!`;

const poolData = (
  symbol: string,
  pools: Record<string, PoolData>,
  tokens: Record<string, TokenData>,
) => {
  const token = Object.values(tokens).find(
    (item: TokenData) => item.symbol === (symbol === "ETH" ? "WETH" : symbol),
  );
  return Object.values(pools).find(
    (item: PoolData) =>
      item.underlyingToken.toLowerCase() === token.address.toLowerCase(),
  );
};

const Form = () => {
  const [index, setIndex] = useState(0);
  const prices = usePrices();
  const unsafePools = usePools();
  const pools = unsafePools instanceof Error ? undefined : unsafePools;
  const [, balancesWithETH] = useTokenBalances();
  const tokensListWithETH = useTokensDataListWithETH();

  const { form, web3 } = useSelector((state: RootState) => state);

  const pool = poolData(form.symbol, pools, tokensListWithETH);

  const {
    underlyingToken,
    dieselToken,
    expectedLiquidity,
    depositAPY,
    address,
  } = pool;

  const underlying = tokensListWithETH[underlyingToken];
  const diesel = tokensListWithETH[dieselToken];

  const { symbol: underlyingTokenSymbol, decimals: underlyingDecimals = 18 } =
    underlying;

  const allowedTokens = usePoolAllowedTokens(underlyingToken);

  const isWSTETH = underlyingToken === currentTokenData.wstETH;
  const wrapFrom = isWSTETH ? currentTokenData.STETH : undefined;
  const wrapTo = isWSTETH ? currentTokenData.wstETH : undefined;

  const collateralAssetsState = useAssets([
    {
      balance: BigNumber.from(0),
      balanceView: "",
      token: unwrapTokenAddress(underlyingToken),
    },
  ]);

  const {
    assets: unwrappedCollateral,
    handlers: { handleChangeAmount },
  } = collateralAssetsState;

  const [wrappedCollateral, ethAmount] = useWrapETH(unwrappedCollateral);
  const [, stethAmount] = useWrapETH(unwrappedCollateral, wrapFrom, wrapTo);

  const collateralAsset = unwrappedCollateral[0];
  const collateralBalance = balancesWithETH[collateralAsset.token];
  const collateralToken = tokensListWithETH[collateralAsset.token];

  const underlyingPrice =
    prices[isWSTETH ? currentTokenData.STETH : underlyingToken];
  const dieselPrice = prices[dieselToken];

  const [totalAPY, poolAPY, farmAPY] = usePoolAPY({
    depositAPY,
    underlying: {
      amount: expectedLiquidity,
      decimals: underlyingDecimals,
      price: underlyingPrice,
    },
    diesel: {
      token: dieselToken,
    },
    gear: {
      price: dieselPrice,
    },
  });

  const token = tokensListWithETH[unwrappedCollateral[index].token];
  const balance = balancesWithETH[unwrappedCollateral[index].token];

  const collateralIsSTETH = collateralAsset.token === currentTokenData.STETH;

  const disableSubmit = () => {
    if (
      unwrappedCollateral[index].balance.gt(
        balancesWithETH[unwrappedCollateral[index].token],
      ) ||
      unwrappedCollateral[index].balance.isZero()
    )
      return true;
    return false;
  };

  const handleSubmit = () => {
    if (!pool || !web3.account || !pool) return;
    const opHash = generateNewHash("POOL-ADD-");
    store.dispatch(
      actions.pools.addLiquidity({
        pool,
        ethAmount: isWSTETH ? stethAmount : ethAmount,
        amount: unwrappedCollateral[0].balance,
        opHash,
      }),
    );
  };

  const exit = () => {
    store.dispatch(actions.form.toggleForm("", ""));
    store.dispatch(actions.game.ChangeStage("PLAY"));
  };

  const updateValue = (input: string, i: number) => {
    const func = handleChangeAmount(0);
    if (isNumeric(input)) {
      const bn = utils.parseUnits(input, token.decimals);
      return func(bn, input.toString());
    }
    func(unwrappedCollateral[0].balance, input.toString());
  };

  return (
    <FormBg>
      <Underground>
        <ExitButton text="Back" func={exit} />
        <Row>
          <Content>
            <h2>{`Deposit ${token.symbol.toUpperCase()} to Gearbox`}</h2>
            <p>{depositLPDescription}</p>
          </Content>

          <FormContainer>
            <InputSuper>
              <span>DEPOSIT</span>
              <span>
                {`BALANCE: 
              ${nFormatter(balance, token.decimals, 3)} 
              ${token.symbol.toUpperCase()}`}
              </span>
            </InputSuper>
            <InputGroup>
              <Input
                placeholder="0.00"
                value={unwrappedCollateral[index].balanceView}
                onChange={e => updateValue(e.target.value, index)}
              />
              {/* <AssetSelector
                i={index}
                assets={allowedTokens}
                tokens={tokensListWithETH}
                func={setIndex}
              /> */}
              <Asset>
                <img width={20} src={token.icon} style={{ borderRadius: 20 }} />
                <span>{token.symbol.toUpperCase()}</span>
              </Asset>
              <MaxButton
                onClick={() =>
                  updateValue(
                    bnToFloat(balance, token.decimals).toString(),
                    index,
                  )
                }
              >
                max
              </MaxButton>
            </InputGroup>
            <APYGroup>
              <span>{`Withdrawal Fee: `}</span>
              <span>{`1%`}</span>
            </APYGroup>
            <APYGroup>
              <span>{`APY: `}</span>
              <span>{`${poolAPY.toFixed(2)}% ${collateralToken.symbol} + ${(
                farmAPY / 10000
              ).toFixed(2)}% GEAR`}</span>
            </APYGroup>
            <SufficientAmountGuard
              amount={collateralAsset.balance}
              balance={collateralBalance}
            >
              <ApproveButton
                assets={wrappedCollateral}
                to={
                  isWSTETH && collateralIsSTETH
                    ? web3.wstethGateway?.address
                    : address
                }
              >
                <SubmitButton onClick={() => handleSubmit()}>
                  {disableSubmit() ? "not enough" : "deposit"}
                </SubmitButton>
              </ApproveButton>
            </SufficientAmountGuard>
          </FormContainer>
        </Row>
      </Underground>
    </FormBg>
  );
};

const AssetSelector: React.FC<{
  i: number;
  assets: string[];
  tokens: Record<string, TokenData>;
  func: React.Dispatch<React.SetStateAction<number>>;
}> = ({ i, tokens, assets, func }) => {
  const [open, setOpen] = useState(false);
  const token = tokens[assets[i]];

  const click = (i: number) => {
    func(i);
    setOpen(false);
  };
  return (
    <AssetButton onClick={() => setOpen(true)}>
      <Asset>
        <img width={20} src={token.icon} style={{ borderRadius: 20 }} />
        <span>{token.symbol.toUpperCase()}</span>
      </Asset>
      {open ? (
        <AssetList>
          {assets.map((address, i) => {
            const item = tokens[address];
            return (
              <Asset onClick={() => click(i)}>
                <img width={20} src={item.icon} style={{ borderRadius: 20 }} />
                <span>{item.symbol.toUpperCase()}</span>
              </Asset>
            );
          })}
        </AssetList>
      ) : null}
    </AssetButton>
  );
};

const AssetButton = styled.div`
  position: relative;
`;

const AssetList = styled.div`
  position: absolute;
  background: black;
  padding: 10px;
`;

const APYGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
`;

const Content = styled.div`
  max-width: 400px;
`;

const Asset = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 6px 4px;
  min-width: 70px;
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
  width: 130px;
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
  margin-top: 0px;
  font-size: 18px;
  width: 100%;
  max-width: 300px;
  padding: 20px;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: gray;
  border: none;
  color: white;
  padding: 15px 8px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 20px;
  margin: 0px;
  font-family: "Press Start 2P";
`;

const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 20%;
  /* justify-content: center; */
  align-items: center;
  min-width: 1023px;
  min-height: 512px;
  width: 100%;
  height: 100%;
  background-image: url("/data/img/underground.png");
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
`;

const FormBg = styled.div`
  height: 100%;
  width: 100%;
  background: #070b13;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Row = styled.div`
  padding: 30px 50px;
  display: flex;
  background-image: url("/data/img/backboard.png");
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
`;

export default Form;
