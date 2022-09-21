import { BigNumber, BigNumberish } from 'ethers'
import styled from 'styled-components'
import React, { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  TokenData,
  LEVERAGE_DECIMALS,
  TokenBalance
} from '@gearbox-protocol/sdk'

const Picker: React.FC<{
  allowedTokens: string[]
  balances: { [x: string]: BigNumberish }
  tokensList: Record<string, TokenData>
}> = ({ allowedTokens = [], balances, tokensList }) => {
  return (
    <div>
      {allowedTokens.map((item) => {
        const token = tokensList[item]
        if (token)
          return (
            <>
              <div>{token.symbol}</div>
              <div>{balances[token.address].toString()}</div>
            </>
          )
      })}
    </div>
  )
}

const Row = styled.span`
  display: flex;
  height: 100%;
  align-items: center;
`
const Col = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #070b13;
  z-index: 200;
`

export default Picker
