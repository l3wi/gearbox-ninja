import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";

import { store } from "../../store";
import actions from "../../store/actions";
import { RootState } from "../../store/reducer";
import { activate, declare } from "../../utils/web3";
import ExitButton from "../exitButton";

const Pause = () => {
  const { account } = useSelector((state: RootState) => state.web3);
  const { isPaused, pause, isIllegal, track } = useSelector(
    (state: RootState) => state.game,
  );

  const exit = () => {
    store.dispatch(actions.game.PauseGame());
  };

  const declareAndUnpause = async () => {
    await declare();
    store.dispatch(actions.game.PauseGame());
  };

  const disconnect = () => {
    store.dispatch(actions.web3.disconnectSigner());
  };

  const toggleMusic = (b: boolean) =>
    store.dispatch(actions.game.ToggleMusic());

  const prior = window.localStorage.getItem("declared");
  return (
    <PauseBG paused={isPaused}>
      <SoundToggle onClick={() => toggleMusic(!track)}>
        {track ? (
          <img src={"/data/img/on.png"} />
        ) : (
          <img src={"/data/img/off.png"} />
        )}
      </SoundToggle>
      {/* <ExitButton text="Back" func={exit} /> */}
      <Title>{isPaused && !pause ? "GAME PAUSED" : pause}</Title>

      <Content>
        {!account && (
          <Col>
            <Row>
              <WalletButton onClick={() => activate("metamask")}>
                <img src="/data/img/metamask.png" height={200} />
              </WalletButton>
              <WalletButton onClick={() => activate("walletConnect")}>
                <img src="/data/img/wallet-connect.png" height={250} />
              </WalletButton>
            </Row>
            <Button style={{ marginTop: 100 }} onClick={() => exit()}>
              BACK TO GAME
            </Button>
          </Col>
        )}
        {account && !isIllegal ? (
          <Col>
            <span>
              Wallet:
              {account.substring(0, 12) + "..." + account.slice(-8)}
            </span>

            <Row>
              <Button onClick={() => disconnect()}>DISCONNECT</Button>
              <Button onClick={() => exit()}>BACK TO GAME</Button>
            </Row>
          </Col>
        ) : null}

        {isIllegal && account && !prior ? (
          <Row>
            <TextCol>
              <p>I hereby further represent and warrant that:</p>
              <p>{`- I’m not a
            resident of or located in the United States of America (including
            its territories: American Samoa, Guam, Puerto Rico, the Northern
            Mariana Islands and the U.S. Virgin Islands) or any other Restricted
            Jurisdiction (as defined in the Terms of Service).`}</p>
              <p>{`- I’m not a Prohibited Person (as defined in the Terms of
              Service) nor acting on behalf of a Prohibited Person.`}</p>
              <p>{`- I understand that if I fail to maintain
              sufficient collateral when using the Gearbox Protocol, my credit
              account(s) may be liquidated, in which case a penalty may be
              charged by the protocol.`}</p>
              <p>{`- I acknowledge that Gearbox App and related
              software are experimental, and that the use of experimental
              software may result in complete loss of my funds.`}</p>

              <Declare onClick={() => declareAndUnpause()}>
                Sign Statement
              </Declare>
            </TextCol>
          </Row>
        ) : null}
      </Content>
    </PauseBG>
  );
};

const SoundToggle = styled.button`
  outline: none;
  border: none;
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: transparent;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 24px;
  font-family: "Press Start 2P";
  padding: 20px 0px;
  align-items: center;
  justify-content: space-between;
  span {
    margin-bottom: 30px;
  }
`;

const TextCol = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1124px;
  font-size: inherit;
  & p {
    @media (max-height: 900px) {
      font-size: smaller;
    }
  }
`;

const Declare = styled.button`
  font-family: "Courier New", Courier, monospace;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  padding: 15px;
`;

const Content = styled.div`
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WalletButton = styled.button`
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid white;
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const Title = styled.h1`
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 48px;
  margin: 80px 0px 0px;
  font-family: "Press Start 2P";
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
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 400px;
  font-size: 24px;
  font-family: "Press Start 2P";
  min-width: 800px;
  margin-top: 40px;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    visibility: hidden;
  }

  to {
    opacity: 1;
    visibility: visible;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    visibility: visible;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const PauseBG = styled.div<{ paused: boolean }>`
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  visibility: ${props => (props.paused ? "visible" : "hidden")};
  animation: ${props => (props.paused ? fadeIn : fadeOut)} 0.5s ease-out;
`;
export default Pause;
