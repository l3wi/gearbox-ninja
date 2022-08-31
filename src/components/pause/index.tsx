import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { RootState } from '../../store/reducer'

const Pause = () => {
  const { currentStage, isPaused, pause } = useSelector(
    (state: RootState) => state.game
  )

  return (
    <PauseBG paused={isPaused}>
      <Title>{isPaused && pause}</Title>
    </PauseBG>
  )
}

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

const Title = styled.h1`
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 48px;
  margin: 15px 0px;
  font-family: 'Press Start 2P';
`

const PauseBG = styled.div<{ paused: boolean }>`
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: ${(props) => (props.paused ? 'visible' : 'hidden')};
  animation: ${(props) => (props.paused ? fadeIn : fadeOut)} 0.5s ease-out;
`
export default Pause
