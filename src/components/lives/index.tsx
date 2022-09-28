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

  if (stage === 'PLAY' && account) {
    return (
      <Container>
        {lives.map((ca) => {
          const token = tokensList[ca.underlyingToken]
          return (
            <Life>
              <a
                href={`${URL}/accounts/${ca.creditManager}`}
                target={'_blank'}
                rel="noopener"
              >
                <img
                  style={{ paddingBottom: 10 }}
                  src={token.icon}
                  width={60}
                  height={60}
                />
              </a>
            </Life>
          )
        })}
        {Array(2 - lives.length)
          .fill('x')
          .map((_, i) => (
            <Life>
              <img src="/data/img/gear.png" height={90} />
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
  align-items: baseline;
  position: fixed;
  bottom: 0px;
  left: 0px;
  padding: 20px 10px;
`

const Life = styled.div`
  padding-left: 20px;
  opacity: 1;
  /* transition: 200ms ease;
  &:hover {
    opacity: 1;
  } */
`

export default Lives
