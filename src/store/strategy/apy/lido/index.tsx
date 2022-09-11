import {
  getLidoAPY as getLidoAPYSdk,
  LIDO_FEE_DECIMALS,
  PERCENTAGE_DECIMALS,
  toSignificant,
  WAD_DECIMALS_POW
} from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'

type LidoAPYProps = Parameters<typeof getLidoAPYSdk>

export async function getLidoAPY(...props: LidoAPYProps) {
  const res = await Promise.allSettled([getLidoAPYSdk(...props)])

  const [apy, lidoFee] =
    res[0].status === 'fulfilled'
      ? res[0].value
      : [BigNumber.from(0), BigNumber.from(0)]

  const apyWithFee = apy.mul(
    BigNumber.from(LIDO_FEE_DECIMALS).sub(BigNumber.from(lidoFee))
  )

  const apyInPercent = apyWithFee
    .mul(PERCENTAGE_DECIMALS)
    .div(LIDO_FEE_DECIMALS)

  return Number(toSignificant(apyInPercent, WAD_DECIMALS_POW))
}
