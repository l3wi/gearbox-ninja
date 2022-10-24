import { TokenData } from '@gearbox-protocol/sdk'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { IS_TEST_NETWORK, TEST_APP_ADDR } from '../../config'
import { useTokensDataListWithETH } from '../../hooks/useTokens'
import { RootState } from '../../store/reducer'
import { nFormatter } from '../../utils/format'

const URL = IS_TEST_NETWORK ? TEST_APP_ADDR : 'https://app.gearbox.fi'

const getAddressFromSymbol = (s: string, details: Record<string, TokenData>) =>
  Object.values(details).find((t) => t.symbol === s)

const Balances = () => {
  const { account, balance } = useSelector((state: RootState) => state.web3)
  const { details, balances } = useSelector((state: RootState) => state.tokens)
  const stage = useSelector((state: RootState) => state.game.currentStage)

  if (stage === 'PLAY' && Object.keys(balances).length) {
    return (
      <Container>
        {['USDC', 'DAI', 'WBTC'].map((i) => (
          <Life>
            <span style={{ paddingRight: 30 }}>{i}</span>
            {nFormatter(
              balances[getAddressFromSymbol(i, details).address],
              getAddressFromSymbol(i, details).decimals,
              2
            )}
          </Life>
        ))}
        <Life>
          <span style={{ paddingRight: 30 }}>ETH</span>
          {nFormatter(balance, 18, 2)}
        </Life>
      </Container>
    )
  } else {
    return null
  }
}

const Container = styled.div`
  width: fit-content;
  display: grid;
  column-gap: 20px;
  row-gap: 10px;
  grid-template-columns: repeat(2, 1fr);
  margin: 0px 0px;
  box-sizing: border-box;
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 1.5rem;
  font-style: normal;
`

const Life = styled.div`
  padding-left: 20px;
  opacity: 1;
  display: flex;
  flex-direction: row;
`

export default Balances
