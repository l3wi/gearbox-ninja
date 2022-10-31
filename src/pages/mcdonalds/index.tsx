import { BigNumber, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import ExitButton from "../../components/exitButton";
import { store } from "../../store";
import actions from "../../store/actions";
import { RootState } from "../../store/reducer";
import { activate, declare } from "../../utils/web3";

const McDonalds = () => {
  const [minter, setMinter] = useState(false);

  const { game, web3 } = useSelector((state: RootState) => state);

  const handleClick = async () => {
    if (web3.noWhitelist) {
      store.dispatch(
        actions.game.AddNotification("You are incapable of ninja-dom!"),
      );
      window.open("https://discord.com/invite/gearbox", "_blank");
      return;
    }
    if (web3.nftClaimed) {
      store.dispatch(actions.game.AddNotification("Go forth & APE!"));
      exit();
      return;
    }

    if (!web3.account) await activate("metamask");
    if (game.isIllegal) await declare();
    setMinter(true);
  };

  const mint = () => store.dispatch(actions.web3.mintNFT());

  const toMcDonalds = () => {
    window.open(
      "https://www.mcdonalds.com/us/en-us/mcdonalds-careers.html",
      "_blank",
    );
  };

  const exit = () => {
    store.dispatch(actions.form.toggleForm("", ""));
    store.dispatch(actions.game.ChangeStage("PLAY"));
  };

  return (
    <FormBg>
      <Underground>
        <ExitButton text="Back" func={exit} />

        <Row>
          <Button onClick={() => toMcDonalds()}>
            <ButtonText>GET A JOB</ButtonText>
          </Button>
          {minter ? (
            <Button style={{ background: "#FF0000" }} onClick={() => mint()}>
              <h2 style={{ margin: "20px 0px" }}>MINT {web3.nftAmount} NFTs</h2>
              <Explainer>
                Each time you open a Credit Account, you burn a DEGEN NFT.
              </Explainer>
              <Explainer>Choose Wisely.</Explainer>
            </Button>
          ) : (
            <Button onClick={() => handleClick()}>
              {!web3.noWhitelist && !web3.nftClaimed ? (
                <ButtonText>BECOME A LEVERAGE NINJA</ButtonText>
              ) : null}
              {web3.noWhitelist && (
                <ButtonText>
                  <Explainer>{`YOU AREN'T A NINJA!`}</Explainer>
                  <Explainer>GO TO DISCORD</Explainer>
                </ButtonText>
              )}
              {web3.nftClaimed && !web3.noWhitelist ? (
                <ButtonText>APE STRATEGIES ACROSS THE BRIDGE</ButtonText>
              ) : null}
            </Button>
          )}
        </Row>
      </Underground>
    </FormBg>
  );
};

const Explainer = styled.span`
  font-size: 28px;
  @media (max-width: 1350px) {
    font-size: 20px;
  }
`;

const Button = styled.button`
  width: 40.5%;
  height: 50.5%;
  margin-right: 4%;
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 35px;
  font-family: "MERCURY115";
  font-size: 28px;
  letter-spacing: 4px;
  text-align: center;
  color: white;
  position: relative;
`;

const ButtonText = styled.div`
  width: 100%;
  padding: 0px 20px 20px;
  height: 70px;
  margin-top: 35%;
`;

const Row = styled.div`
  width: 100%;
  height: 100%;
  min-height: 512px;
  min-width: 1024px;
  aspect-ratio: 2 / 1;

  display: flex;
  padding-top: 9%;
  padding-bottom: 0%;
  padding-left: 7.5%;
`;

const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 1024px;
  min-height: 512px;
  max-width: calc(100vh * 2);
  max-height: calc(100vw / 2);
  width: 100%;
  height: 100%;
  background-image: url("/data/img/mcdonalds.png");
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
  aspect-ratio: 2 / 1;
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
export default McDonalds;
