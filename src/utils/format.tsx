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
