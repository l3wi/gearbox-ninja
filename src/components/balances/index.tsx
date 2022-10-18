import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { IS_TEST_NETWORK, TEST_APP_ADDR } from '../../config'
import { useTokensDataListWithETH } from '../../hooks/useTokens'
import { RootState } from '../../store/reducer'
import { nFormatter } from '../../utils/format'

const URL = IS_TEST_NETWORK ? TEST_APP_ADDR : 'https://app.gearbox.fi'

const Balances = () => {
  const tokensList = useTokensDataListWithETH()
  const { account } = useSelector((state: RootState) => state.web3)
  const stage = useSelector((state: RootState) => state.game.currentStage)
  const CAs = useSelector((state: RootState) => state.creditAccounts.list)

  const accounts = CAs ? Object.values(CAs) : []

  if (stage === 'PLAY' && account) {
    return (
      <Container>
        {accounts.map((ca) => {
          const { symbol, decimals } = tokensList[ca.underlyingToken]
          return (
            <Life>{`${symbol}: ${nFormatter(
              ca.borrowedAmount,
              decimals,
              0
            )}`}</Life>
          )
        })}
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
  left: 0px;
  padding: 0px 10px;
  margin: 30px 0px;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
`

const Life = styled.div`
  padding-left: 20px;
  opacity: 1;
`

export default Balances
