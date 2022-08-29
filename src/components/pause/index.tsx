import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { RootState } from '../../store/reducer'

const Pause = () => {
  const isPaused = useSelector((state: RootState) => state.game.isPaused)

  return (
    <PauseBG invisible={isPaused}>
      <Title>Game Paused</Title>
    </PauseBG>
  )
}

interface BgProps {
  readonly invisible: boolean
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
  visibility: ${(props) => (props.invisible ? 'visible' : 'hidden')};
`

export default Pause
