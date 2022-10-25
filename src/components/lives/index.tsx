import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { IS_TEST_NETWORK, TEST_APP_ADDR } from "../../config";
import { useTokensDataListWithETH } from "../../hooks/useTokens";
import { RootState } from "../../store/reducer";

const URL = IS_TEST_NETWORK ? TEST_APP_ADDR : "https://app.gearbox.fi";

const Lives = () => {
  const tokensList = useTokensDataListWithETH();
  const { account, nftBalance, nftAmount } = useSelector(
    (state: RootState) => state.web3
  );
  const CAs = useSelector((state: RootState) => state.creditAccounts.list);
  const stage = useSelector((state: RootState) => state.game.currentStage);
  const lives = nftBalance ? nftBalance : 0;

  const total = nftAmount ? nftAmount : 0;
  if (stage === "PLAY" && account && lives > 0) {
    return (
      <Container>
        LIVES:
        {CAs &&
          Array(lives)
            .fill("x")
            .map((_, i) => (
              <Life style={{ opacity: 0.3 }}>
                <img src="/data/img/ninja.png" height={64} />
              </Life>
            ))}
        {CAs
          ? Array(total - lives)
              .fill("x")
              .map((_, i) => (
                <Life>
                  <img src="/data/img/ninja.png" height={64} />
                </Life>
              ))
          : null}
      </Container>
    );
  } else {
    return null;
  }
};

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 10px;
  margin: 20px 0px;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 1.5rem;
  font-style: normal;
`;

const Life = styled.div`
  padding-left: 10px;
  opacity: 1;
  /* transition: 200ms ease;
  &:hover {
    opacity: 1;
  } */
`;

export default Lives;
