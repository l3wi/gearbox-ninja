import { BigNumber } from 'ethers'
import {
  toSignificant,
  getLidoApy,
  WAD_DECIMALS_POW,
  PERCENTAGE_DECIMALS,
  LIDO_FEE_DECIMALS
} from '@gearbox-protocol/sdk'

type LidoApyProps = Parameters<typeof getLidoApy>

export async function lidoAPY(...props: LidoApyProps) {
  const [apy, lidoFee] = await getLidoApy(...props)

  const apyWithFee = apy.mul(
    BigNumber.from(LIDO_FEE_DECIMALS).sub(BigNumber.from(lidoFee))
  )

  const apyInPercent = apyWithFee
    .mul(PERCENTAGE_DECIMALS)
    .div(LIDO_FEE_DECIMALS)

  return Number(toSignificant(apyInPercent, WAD_DECIMALS_POW))
}
