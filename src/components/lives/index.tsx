import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { IS_TEST_NETWORK, TEST_APP_ADDR } from '../../config'
import { useTokensDataListWithETH } from '../../hooks/useTokens'
import { RootState } from '../../store/reducer'

const URL = IS_TEST_NETWORK ? TEST_APP_ADDR : 'https://app.gearbox.fi'

const Lives = () => {
  const tokensList = useTokensDataListWithETH()
  const { account } = useSelector((state: RootState) => state.web3)
  const CAs = useSelector((state: RootState) => state.creditAccounts.list)
  const stage = useSelector((state: RootState) => state.game.currentStage)
  const lives = CAs ? Object.values(CAs) : []

  const total = 2
  if (stage === 'PLAY' && account) {
    return (
      <Container>
        LIVES:
        {CAs &&
          Array(lives.length)
            .fill('x')
            .map((_, i) => (
              <Life style={{ opacity: 0.3 }}>
                <img src="/data/img/ninja.png" height={64} />
              </Life>
            ))}
        {CAs &&
          Array(total - lives.length)
            .fill('x')
            .map((_, i) => (
              <Life>
                <img src="/data/img/ninja.png" height={64} />
              </Life>
            ))}
      </Container>
    )
  } else {
    return null
  }
}

const Container = styled.div`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0px;
  right: 0px;
  padding: 0px 10px;
  margin: 20px 0px;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
`

const Life = styled.div`
  padding-left: 10px;
  opacity: 1;
  /* transition: 200ms ease;
  &:hover {
    opacity: 1;
  } */
`

export default Lives
