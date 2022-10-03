import {
  calcTotalPrice,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  toSignificant,
  WAD,
  WAD_DECIMALS_POW
} from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'

const BLOCKS_IN_YEAR = (365 * 24 * 60 * 60) / 12
const GEARS_PER_BLOCK = 1

const GEAR_AMOUNT = BigNumber.from(BLOCKS_IN_YEAR).mul(GEARS_PER_BLOCK)

interface GetFarmingAPYProps {
  gear: {
    price: BigNumber
  }
  underlying: {
    price: BigNumber
    decimals: number
    amount: BigNumber
  }
}

export function getFarmingAPY({ underlying, gear }: GetFarmingAPYProps) {
  const supply = calcTotalPrice(
    underlying.price,
    underlying.amount,
    underlying.decimals
  )

  if (supply.lte(0)) return 0

  const gearAmount = calcTotalPrice(gear.price, GEAR_AMOUNT, 0)

  const apyBn = gearAmount.mul(WAD).div(supply)

  return Math.round(
    Number(
      toSignificant(
        apyBn.mul(PERCENTAGE_FACTOR).mul(PERCENTAGE_DECIMALS),
        WAD_DECIMALS_POW
      )
    )
  )
}
