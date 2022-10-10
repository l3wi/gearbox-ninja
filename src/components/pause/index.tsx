import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { activate, declare } from '../../utils/web3'

const Pause = () => {
  const { game, web3 } = useSelector((state: RootState) => state)
  const { account } = web3
  const { isPaused, pause, isIllegal } = game

  const exit = () => {
    store.dispatch(actions.game.PauseGame())
  }

  const declareAndUnpause = async () => {
    await declare()
    store.dispatch(actions.game.PauseGame())
  }

  const disconnect = () => {
    store.dispatch(actions.web3.disconnectSigner())
  }

  return (
    <PauseBG paused={isPaused}>
      <ExitButton onClick={() => exit()}>X</ExitButton>
      <Content>
        <Title>{isPaused && pause}</Title>

        {!account && (
          <Row>
            <WalletButton onClick={() => activate('metamask')}>
              <img src="/data/img/metamask.png" height={200} />
            </WalletButton>
            <WalletButton>
              <img src="/data/img/wallet-connect.png" height={250} />
            </WalletButton>
          </Row>
        )}
        {account && !isIllegal ? (
          <Row>
            Wallet:
            <span>{account.substring(0, 8) + '...' + account.slice(-5)}</span>
            <Button onClick={() => disconnect()}>X</Button>
          </Row>
        ) : null}

        {isIllegal && account ? (
          <Row>
            <TextCol>
              <p>{`I hereby further represent and warrant that:`}</p>
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
  )
}
const TextCol = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1124px;
`

const Declare = styled.button`
  font-family: 'Courier New', Courier, monospace;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  padding: 15px;
`

const Content = styled.div`
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

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
`

const Title = styled.h1`
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 48px;
  margin: 15px 0px;
  font-family: 'Press Start 2P';
`
const Button = styled.button`
  font-family: 'Courier New', Courier, monospace;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  border: none;
  font-size: 24px;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 400px;
  font-size: 24px;
  font-family: 'Press Start 2P';
  min-width: 800px;
  margin-top: 40px;
`

const ExitButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  font-family: 'Courier New', Courier, monospace;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  border: none;
`
const fadeIn = keyframes`
  from {
    opacity: 0;
    visibility: hidden;
  }

  to {
    opacity: 1;
    visibility: visible;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    visibility: visible;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
`

const PauseBG = styled.div<{ paused: boolean }>`
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  visibility: ${(props) => (props.paused ? 'visible' : 'hidden')};
  animation: ${(props) => (props.paused ? fadeIn : fadeOut)} 0.5s ease-out;
`
export default Pause
