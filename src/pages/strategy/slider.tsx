import { formatLeverage, LEVERAGE_DECIMALS } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";

const MIN_LEVERAGE = LEVERAGE_DECIMALS + 1;

const Slider: React.FC<{
  amount: BigNumber;
  minAmount: BigNumber;
  maxAmount: BigNumber;

  maxLeverage: number;
  leverage: number;
  setLeverage: (v: number) => void;
}> = ({
  amount,
  minAmount,
  maxAmount,

  maxLeverage,
  leverage,
  setLeverage,
}) => {
  const maxLeverageFull = useMemo(
    () => maxLeverage + LEVERAGE_DECIMALS,
    [maxLeverage]
  );

  const [availableStart, availableEnd] = useMemo(() => {
    const max = getMaxLeverage(amount, maxAmount, maxLeverageFull);
    const min = getMinLeverage(amount, minAmount);

    return [
      limitLeverage(maxLeverageFull)(min),
      limitLeverage(maxLeverageFull)(max),
    ];
  }, [amount, minAmount, maxAmount, maxLeverageFull]);

  const handleLeverageChange = (l: number) => {
    if (l >= availableEnd)
      return setLeverage(defaultNextLeverage(availableEnd, maxLeverageFull));
    if (availableStart >= l)
      return setLeverage(defaultNextLeverage(availableStart, maxLeverageFull));
    setLeverage(defaultNextLeverage(l, maxLeverageFull));
  };

  useEffect(() => {
    handleLeverageChange(leverage);
  }, [amount, minAmount, maxAmount]);
  return (
    <Container>
      <Row>
        {/* <span>Leverage</span> */}
        <span />
        <span> &nbsp;x{formatLeverage(leverage)}x</span>
      </Row>
      <LineBox
        min={availableStart - MIN_LEVERAGE}
        max={maxLeverageFull - availableEnd}
      >
        <Line />
        <Input
          type="range"
          min={availableStart}
          max={availableEnd}
          value={leverage}
          onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
        />
      </LineBox>
    </Container>
  );
};

const Box = styled.div`
  position: relative;
`;

interface TitleProps {
  readonly min: number;
  readonly max: number;
}

const LineBox = styled.div<TitleProps>`
  padding-left: ${(props) => props.min / 10 + "%"};
  padding-right: ${(props) => props.max / 10 + "%"};
`;
const Line = styled.div`
  position: absolute;
  background: white;
  width: 100%;
  height: 7px;
  top: 25px;
  left: 0px;
`;

function defaultNextLeverage(l: number, maxLeverage: number) {
  return limitLeverage(maxLeverage)(l);
}

function limitLeverage(maxLeverage: number) {
  return (l: number) => {
    if (l > maxLeverage) return maxLeverage;
    if (l < MIN_LEVERAGE) return MIN_LEVERAGE;
    return l;
  };
}

export const getMinLeverage = (amount: BigNumber, minAmount: BigNumber) => {
  const leverage = amount.gt(0)
    ? minAmount
        .mul(LEVERAGE_DECIMALS)
        .div(amount)
        .add(LEVERAGE_DECIMALS)
        .toNumber()
    : MIN_LEVERAGE;

  return leverage;
};

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
    : maxLeverage;

  return leverage;
};

const Row = styled.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Container = styled.div`
  position: relative;
  display: block;
  font-size: 14px;
  width: 100%;
`;

const Input = styled.input`
  outline: none;
  width: 100%;
  position: relative;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: green;
    position: absolute;
    /* border-radius: 2px; */
  }
  &::-webkit-slider-thumb {
    position: relative;
    -webkit-appearance: none;
    appearance: none;
    top: -50%;
  }
`;

export default Slider;
