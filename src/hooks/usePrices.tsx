import { calcTotalPrice, convertByPrice } from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { pricesSelector } from '../store/prices'

export function usePrices(): Record<string, BigNumber> {
  const prices = useSelector(pricesSelector)
  return prices
}

interface Source {
  price: BigNumber
  amount: BigNumber
  decimals: number | undefined
}

interface Target {
  price: BigNumber
  decimals: number | undefined
}

export function useConvertByPrice(
  { price: fromPrice, amount: fromAmount, decimals: fromDecimal }: Source,
  { price: toPrice, decimals: toDecimals }: Target
): BigNumber {
  const hexFromAmount = fromAmount.toHexString()
  const hexFromPrice = fromPrice.toHexString()
  const hexToPrice = toPrice.toHexString()

  const amount = useMemo(
    () =>
      convertByPrice(calcTotalPrice(fromPrice, fromAmount, fromDecimal), {
        price: toPrice,
        decimals: toDecimals
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hexFromPrice, hexFromAmount, fromDecimal, hexToPrice, toDecimals]
  )
  return amount
}
