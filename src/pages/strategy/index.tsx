import { TokenData } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {} from "redux-thunk/extend-redux";
import styled from "styled-components";

import ExitButton from "../../components/exitButton";
import {
  useAPYSync,
  useStrategyCreditManagers,
  useStrategyList,
} from "../../hooks/useStrategy";
import {
  useTokenBalances,
  useTokensDataList,
  useTokensDataListWithETH,
} from "../../hooks/useTokens";
import { store } from "../../store";
import actions from "../../store/actions";
import { RootState } from "../../store/reducer";
import OpenStrategyDialog from "./openStrategy";

const getStrategy = (state: RootState) => {
  const { symbol } = state.form;
  const strategy = Object.values(state.strategy.strategies).find(strat =>
    strat.name.toLowerCase().includes(symbol.toLowerCase()),
  );
  return strategy;
};
export type OpenStrategyModel = "openStrategy" | "selectToken" | "selectPool";

const Form = () => {
  const dispatch = useDispatch();

  useAPYSync();
  const [strategies, creditManagers] = useStrategyList();

  const state = useSelector((state: RootState) => state);
  const { form } = state;
  const { symbol } = form;

  const strategy = getStrategy(state);
  const strategyCms = useStrategyCreditManagers(strategy, creditManagers);

  const tokens = useTokensDataListWithETH();
  const [, balancesWithETH] = useTokenBalances();

  const lpToken = tokens[strategy.lpToken];

  const availablePools = useMemo(() => Object.keys(strategyCms), [strategyCms]);
  const [selectedPool, setSelectedPool] = useState(availablePools[0]);

  const creditManager = creditManagers[selectedPool];

  const handleChangePool = (address: string) => {
    setSelectedPool(address);
  };

  const isLoading = !creditManager;
  const exit = () => {
    store.dispatch(actions.form.toggleForm("", ""));
    store.dispatch(actions.game.ChangeStage("PLAY"));
  };

  const click = () => window.open("https://app.gearbox.fi/accounts/", "_blank");

  return (
    <FormBg>
      <Underground>
        <ExitButton text="Back" func={exit} />

        {!isLoading ? (
          <>
            <h1 style={{ fontSize: "52px" }}>
              {`Invest in ${strategy.name} `}
              <img width={30} src={lpToken.icon} />
            </h1>
            <OpenStrategyDialog
              strategy={strategy}
              creditManager={creditManager}
              balances={balancesWithETH}
              tokensList={tokens}
              pools={availablePools}
              poolChange={handleChangePool}
            />
          </>
        ) : (
          <Group>
            <h1>Congratulations!</h1>
            <h1>{`You're a Leverage Ninja`}</h1>

            <Button onClick={() => click()}>Manage your account</Button>
          </Group>
        )}
      </Underground>
    </FormBg>
  );
};

const Group = styled.div`
  font-family: "Courier New", Courier, monospace;
  font-family: "Press Start 2P";
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 30px;
`;

const Button = styled.button`
  font-family: "Courier New", Courier, monospace;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  border: 2px white solid;
  padding: 15px;
  font-size: 24px;
  min-width: 500px;
`;
const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 1023px;
  min-height: 512px;
  width: 100%;
  height: 100%;
  background-image: url("/data/img/pagoda.png");
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
  background: #8ea1c6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Form;
