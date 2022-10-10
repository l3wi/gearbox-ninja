import { BigNumberish, BigNumber } from 'ethers'

export const nFormatter = (
  bn: BigNumberish,
  decimals: number,
  fixed: number
) => {
  const currency = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  })

  const num = bnToFloat(bn, decimals)

  const lookup = [
    { value: 1, symbol: '' },
    // { value: 1e3, symbol: 'k' },
    // { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value
    })
  return item
    ? currency.format(
        parseFloat((num / item.value).toFixed(fixed).replace(rx, '$1'))
      ) + item.symbol
    : '0'
}

export const bnToFloat = (bn: BigNumberish, decimals: number) => {
  return parseFloat(
    BigNumber.from(bn)
      .div(BigNumber.from('10').pow(BigNumber.from(decimals)))
      .toString()
  )
}

export function isNumeric(str: string) {
  if (typeof str != 'string') return false // we only process strings!
  return (
    //@ts-ignore
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ) // ...and ensure strings of whitespace fail
}

export function isLongString(str: string, maxLength: number): boolean {
  return str.length > maxLength
}

export function shortenString(str: string, maxLength: number): string {
  if (isLongString(str, maxLength)) {
    return `${str.slice(0, maxLength - 3)}...`
  }
  return str
}
