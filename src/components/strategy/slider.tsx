import React, { RefObject, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const Slider: React.FC<{
  min: number
  max: number
  value: number
  func: any
}> = ({ min, max, value, func }) => {
  return (
    <Container>
      <Row>
        <span>Leverage</span>
        <span>{value}x</span>
      </Row>
      <Input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => func(e.target.value)}
      />
    </Container>
  )
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
