import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'

const Pause = () => {
  const { game, web3 } = useSelector((state: RootState) => state)
  const { account } = web3
  const { isPaused, pause } = game

  const exit = () => {
    store.dispatch(actions.game.PauseGame())
  }

  const disconnect = () => {
    store.dispatch(actions.web3.disconnectSigner())
  }

  return (
    <PauseBG paused={isPaused}>
      <ExitButton onClick={() => exit()}>X</ExitButton>
      <Title>{isPaused && pause}</Title>
      {account ? (
        <Row>
          Wallet:
          <span>{account.substring(0, 8) + '...' + account.slice(-5)}</span>
          <Button onClick={() => disconnect()}>X</Button>
        </Row>
      ) : (
        <Row>
          Wallet:
          <div>not connected</div>
        </Row>
      )}
    </PauseBG>
  )
}
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
