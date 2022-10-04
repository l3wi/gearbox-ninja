import { BigNumber } from 'ethers'
import styled from 'styled-components'
import React, { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type {} from 'redux-thunk/extend-redux'

import { store } from '../../store'
import actions from '../../store/actions'
import { RootState } from '../../store/reducer'
import { TokenData } from '@gearbox-protocol/sdk'
import {
  useStrategyCreditManagers,
  useStrategyList,
  useAPYSync
} from '../../hooks/useStrategy'

import OpenStrategyDialog from './openStrategy'

const getStrategy = (state: RootState) => {
  const { symbol } = state.form
  const strategy = Object.values(state.strategy.strategies).find((strat) =>
    strat.name.toLowerCase().includes(symbol)
  )
  return strategy
}
export type OpenStrategyModel = 'openStrategy' | 'selectToken' | 'selectPool'

const Form = () => {
  const dispatch = useDispatch()

  useAPYSync()
  const [strategies, creditManagers] = useStrategyList()

  const state = useSelector((state: RootState) => state)
  const { tokens, form } = state
  const { symbol } = form

  const strategy = getStrategy(state)
  const strategyCms = useStrategyCreditManagers(strategy, creditManagers)

  const availablePools = useMemo(() => Object.keys(strategyCms), [strategyCms])
  const [selectedPool, setSelectedPool] = useState(availablePools[0])

  const creditManager = creditManagers[selectedPool]

  const handleChangePool = (address: string) => {
    setSelectedPool(address)
  }

  const isLoading = !creditManager
  const exit = () => {
    store.dispatch(actions.form.toggleForm('', ''))
    store.dispatch(actions.game.ChangeStage('PLAY'))
  }

  return (
    <FormBg>
      <Underground>
        <ExitButton onClick={() => exit()}>✕</ExitButton>

        {!isLoading ? (
          <>
            <h1 style={{ fontSize: '52px' }}>
              {`Invest in ${symbol.toUpperCase()} `}
              <img
                width={30}
                src={`https://static.gearbox.fi/tokens/${symbol.toLowerCase()}.svg`}
              />
            </h1>
            <OpenStrategyDialog
              strategy={strategy}
              creditManager={creditManager}
            />
          </>
        ) : (
          <>
            <h1>{`Congratulations! You're a Leverage Ninja!`}</h1>
            <h3>
              To manage this Credit Account go to{' '}
              <a href={`https://app.gearbox.fi/accounts/`}>Gearbox.fi →</a>
            </h3>
          </>
        )}
      </Underground>
    </FormBg>
  )
}

function useLiquidationAssets(
  assets: Array<string>,
  underlyingToken: string,
  tokensList: Record<string, TokenData>
): Array<string> {
  const liquidationAssets = useMemo(
    () =>
      assets
        .filter((address) => address !== underlyingToken)
        .map((address) => {
          const { symbol } = tokensList[address] || {}

          return symbol
        })
        .filter((symbol) => symbol),
    [assets, underlyingToken, tokensList]
  )
  return liquidationAssets
}

const Group = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
  font-size: 14px;
  width: 100%;
`

const RmItem = styled.button`
  outline: none;
  border: none;
  background: none;
  font-family: 'Press Start 2P';
  color: white;
  font-size: 15px;
`

const PickerButton = styled.button`
  width: 100%;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  padding: 15px 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 15px;
  margin: 0px;
  font-family: 'Press Start 2P';
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: 0.1s ease-in-out;
  &:hover {
    border: 2px solid rgba(255, 255, 255, 1);
    color: rgba(255, 255, 255, 1);
  }
`

const Section = styled.div`
  padding: 10px 0px;
`

const InputSuper = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 2px solid white;
  /* padding: 3px 2px; */
  box-sizing: border-box;
  height: 45px;
`

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  color: white;
  width: 150px;
  padding: 5px 8px 0px;
  font-size: 18px;
`

const MaxButton = styled.div`
  background: transparent;
  color: white;
  border: none;
  font-size: 18px;
  padding: 4px 6px;
  text-align: center;
  font-family: 'Press Start 2P';
  border-left: 2px solid white;
  display: flex;
  align-items: center;
`

const FormContainer = styled.div`
  font-size: 18px;
  width: 100%;
  max-width: 350px;
  padding: 20px;
`

const ExecuteButton = styled.button`
  width: 100%;
  background: gray;
  border: none;
  color: white;
  padding: 15px 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0px;
  font-family: 'Press Start 2P';
`

const ExitButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  border: none;
  background: none;
  color: white;
  font-size: x-large;
  text-transform: uppercase;
  font-family: 'Press Start 2P';
`
// BG

const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 1023px;
  min-height: 512px;
  width: 100%;
  height: 100%;
  background-image: url('/data/img/pagoda.png');
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: contain;
  -moz-background-size: contain;
  -o-background-size: contain;
  background-size: contain;
`

const FormBg = styled.div`
  height: 100%;
  width: 100%;
  background: #8ea1c6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default Form
