import {
  CurveAPYResult,
  getCurveAPY as getCurveAPYSdk,
  objectEntries,
  PERCENTAGE_DECIMALS,
  toSignificant,
  WAD_DECIMALS_POW
} from '@gearbox-protocol/sdk'

export type CurveApy = Record<keyof CurveAPYResult, number>

export async function getCurveAPY(): Promise<[CurveApy, CurveAPYResult]> {
  const crv = await getCurveAPYSdk()

  const crvMap = objectEntries(crv).reduce<CurveApy>(
    (acc, [crvSymbol, apy]) => {
      const apyInPercent = apy.mul(PERCENTAGE_DECIMALS)
      acc[crvSymbol] = Number(toSignificant(apyInPercent, WAD_DECIMALS_POW))
      return acc
    },
    {} as CurveApy
  )

  return [crvMap, crv]
}
