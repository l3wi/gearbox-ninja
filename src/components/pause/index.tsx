import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { keyframes } from 'styled-components'
import { RootState } from '../../store/reducer'

const Pause = () => {
  const isPaused = useSelector((state: RootState) => state.game.isPaused)

  return (
    <PauseBG paused={isPaused}>
      <Title>Game Paused</Title>
    </PauseBG>
  )
}

interface BgProps {
  readonly paused: boolean
}

const Title = styled.h1`
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 48px;
  margin: 15px 0px;
  font-family: 'Press Start 2P';
`

const PauseBG = styled.div<BgProps>`
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`
/* animation-fill-mode: ${(props) => (props.paused ? 'inherit' : 'forwards')};
  animation: ${(props) =>
    props.paused
      ? `${outAnimation} 270ms ease-out`
      : `${inAnimation} 250ms ease-in`};
`
const inAnimation = keyframes`
  0% {
    opacity: 0;
    visibility: hidden;
  }
  100% {
    opacity: 1;
    visibility: visible;
  }
`
const outAnimation = keyframes`
 0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
` */

export default Pause
