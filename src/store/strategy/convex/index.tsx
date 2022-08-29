import {
  getConvexApy,
  toSignificant,
  WAD_DECIMALS_POW,
  PERCENTAGE_DECIMALS
} from '@gearbox-protocol/sdk'

type ConvexApyProps = Parameters<typeof getConvexApy>

export async function convexAPY(...props: ConvexApyProps): Promise<number> {
  const apy = await getConvexApy(...props)

  const apyInPercent = apy.mul(PERCENTAGE_DECIMALS)

  return Number(toSignificant(apyInPercent, WAD_DECIMALS_POW))
}
