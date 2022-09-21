import { BigNumber } from 'ethers'
import React, { RefObject, useState, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { formatLeverage, LEVERAGE_DECIMALS } from '@gearbox-protocol/sdk'

const MIN_LEVERAGE = LEVERAGE_DECIMALS + 1

const Slider: React.FC<{
  amount: BigNumber
  minAmount: BigNumber
  maxAmount: BigNumber

  maxLeverage: number
  leverage: number
  setLeverage: (v: number) => void
}> = ({
  amount,
  minAmount,
  maxAmount,

  maxLeverage,
  leverage,
  setLeverage
}) => {
  const maxLeverageFull = useMemo(
    () => maxLeverage + LEVERAGE_DECIMALS,
    [maxLeverage]
  )

  const [availableStart, availableEnd] = useMemo(() => {
    const max = getMaxLeverage(amount, maxAmount, maxLeverageFull)
    const min = getMinLeverage(amount, minAmount)

    return [
      limitLeverage(maxLeverageFull)(min),
      limitLeverage(maxLeverageFull)(max)
    ]
  }, [amount, minAmount, maxAmount, maxLeverageFull])

  const handleLeverageChange = (l: number) => {
    setLeverage(defaultNextLeverage(l, maxLeverageFull))
  }

  return (
    <Container>
      <Row>
        <span>Leverage</span>
        <span> &nbsp;x{formatLeverage(leverage)}x</span>
      </Row>
      <Input
        type="range"
        min={availableStart}
        max={availableEnd}
        value={leverage}
        onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
      />
    </Container>
  )
}

function defaultNextLeverage(l: number, maxLeverage: number) {
  return limitLeverage(maxLeverage)(l)
}

function limitLeverage(maxLeverage: number) {
  return (l: number) => {
    if (l > maxLeverage) return maxLeverage
    if (l < MIN_LEVERAGE) return MIN_LEVERAGE
    return l
  }
}

export const getMinLeverage = (amount: BigNumber, minAmount: BigNumber) => {
  const leverage = amount.gt(0)
    ? minAmount
        .mul(LEVERAGE_DECIMALS)
        .div(amount)
        .add(LEVERAGE_DECIMALS)
        .toNumber()
    : MIN_LEVERAGE

  return leverage
}

export const getMaxLeverage = (
  amount: BigNumber,
  maxAmount: BigNumber,
  maxLeverage: number
) => {
  const leverage = amount.gt(0)
    ? maxAmount
        .mul(LEVERAGE_DECIMALS)
        .div(amount)
        .add(LEVERAGE_DECIMALS)
        .toNumber()
    : maxLeverage

  return leverage
}

const Row = styled.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

const Container = styled.div`
  font-size: 14px;
  width: 100%;
`

const Input = styled.input`
  outline: none;
  width: 100%;
  position: relative;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: white;
    border-radius: 2px;
  }
  &::-webkit-slider-thumb {
    position: relative;
    -webkit-appearance: none;
    appearance: none;
    top: -50%;
  }
`

export default Slider
