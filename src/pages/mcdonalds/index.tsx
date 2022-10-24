import { BigNumber, utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { activate, declare } from '../../utils/web3'
import ExitButton from '../../components/exitButton'

const McDonalds = () => {
  const { game, web3 } = useSelector((state: RootState) => state)

  const handleClick = async () => {
    if (web3.noWhitelist) {
      store.dispatch(
        actions.game.AddNotification('You are incapable of ninja-dom!')
      )
      window.open('https://discord.com/invite/gearbox', '_blank')
      return
    }
    if (web3.nftClaimed)
      return store.dispatch(
        actions.game.AddNotification('You are already a ninja!')
      )
    if (!web3.account) await activate('metamask')
    if (game.isIllegal) await declare()
    store.dispatch(actions.web3.mintNFT())
  }

  const toMcDonalds = () => {
    window.open(
      'https://www.mcdonalds.com/us/en-us/mcdonalds-careers.html',
      '_blank'
    )
  }

  const exit = () => {
    store.dispatch(actions.form.toggleForm('', ''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  return (
    <FormBg>
      <Underground>
        <ExitButton text="Back" func={exit} />

        <Row>
          <Button onClick={() => toMcDonalds()}>
            <ButtonText>GET A JOB</ButtonText>
          </Button>
          <Button onClick={() => handleClick()}>
            {!web3.noWhitelist && !web3.nftClaimed ? (
              <ButtonText>BECOME A LEVERAGE NINJA</ButtonText>
            ) : null}
            {web3.noWhitelist && (
              <ButtonText>
                YOU CAN'T BECOME A NINJA! <br />
                GO TO DISCORD
              </ButtonText>
            )}
            {web3.nftClaimed && !web3.noWhitelist ? (
              <ButtonText>YOU ARE ALREADY A NINJA!</ButtonText>
            ) : null}
          </Button>
        </Row>
      </Underground>
    </FormBg>
  )
}

const ButtonText = styled.div`
  font-family: 'MERCURY115';
  width: 100%;
  color: white;
  font-size: 28px;
  letter-spacing: 4px;
  padding: 0px 20px 20px;
  height: 70px;
`

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
`
const Button = styled.button`
  width: 40.5%;
  height: 50.5%;
  margin-right: 4%;
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  line-height: 35px;
`

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
  background-image: url('/data/img/mcdonalds.png');
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
  aspect-ratio: 2 / 1;
`

const FormBg = styled.div`
  height: 100%;
  width: 100%;
  background: #070b13;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
export default McDonalds
