import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { BLOCK_UPDATE_DELAY } from "../../config";
import useLocalStorage from "../../hooks/useLocalStorage";
import HomePage from "../../pages/home";
import McDonalds from "../../pages/mcdonalds";
import PoolForm from "../../pages/pools";
import StrategyFrom from "../../pages/strategy";
import actions from "../../store/actions";
import { RootState } from "../../store/reducer";
import { activate, declare } from "../../utils/web3";
import Balances from "../balances";
import Lives from "../lives";
import Notification from "../notification";
import Pause from "../pause";
import Video from "../video";

const Page = () => {
  const currentStage = useSelector(
    (state: RootState) => state.game.currentStage
  );
  const isPaused = useSelector((state: RootState) => state.game.isPaused);
  const form = useSelector((state: RootState) => state.form);
  const provider = useSelector((state: RootState) => state.web3.provider);

  const dispatch = useDispatch();
  const [cron, setCron] = useState<number | undefined>();
  useEffect(() => {
    if (provider) {
      if (cron) window.clearInterval(cron);

      const syncTask = () => {
        // @ts-ignore
        dispatch(actions.sync.updateLastBlock(provider));
      };

      syncTask();
      const updateTask = window.setInterval(syncTask, BLOCK_UPDATE_DELAY);

      setCron(updateTask);
    }

    return function syncCleanup() {
      if (cron) {
        clearInterval(cron);
        setCron(undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.connection.url]);

  return (
    <Layout>
      {/* Paused */}
      {/* Forms */}
      {!form.isHidden && form.type === "tube" ? <PoolForm /> : null}
      {!form.isHidden && form.type === "entrance" ? <StrategyFrom /> : null}
      {!form.isHidden && form.type === "mcdonalds" ? <McDonalds /> : null}
      {currentStage === "MENU" && <HomePage />}

      {/* Notification */}
      {isPaused && <Pause />}

      <Container>
        <Balances />
        <Lives />
      </Container>

      <Notification />
      <Video />
    </Layout>
  );
};
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: fixed;
  top: 0px;
  right: 0px;
  padding: 20px 10px;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
`;

const Layout = styled.main`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 50;
  font-weight: 800;
  font-family: "Courier New", Courier, monospace;
`;

export default Page;
