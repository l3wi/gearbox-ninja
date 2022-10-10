import { BigNumber, utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { activate, declare } from '../../utils/web3'

const McDonalds = () => {
  const { game, web3 } = useSelector((state: RootState) => state)

  const handleClick = async () => {
    if (!web3.account) await activate('metamask')
    if (game.isIllegal) await declare()
    store.dispatch(actions.web3.mintNFT())
  }

  const exit = () => {
    store.dispatch(actions.form.toggleForm('', ''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>X</ExitButton>
        <Row>
          <Button></Button>
          <Button onClick={() => handleClick()}></Button>
        </Row>
      </Underground>
    </FormBg>
  )
}

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
`

const ExitButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  border: none;
  background: none;
  color: white;
  font-size: x-large;
  font-family: 'Press Start 2P';
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
