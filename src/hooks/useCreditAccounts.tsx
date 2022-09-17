import {
  Asset,
  calcMaxIncreaseBorrow,
  calcOverallAPY,
  CalcOverallAPYProps,
  CreditAccountData,
  isLPToken,
  TokenData
} from '@gearbox-protocol/sdk'
import { BigNumber } from 'ethers'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { APP_VERSION } from '../config'
import { currentTokenData, getLPTokenOut } from '../config/tokens'
import actions from '../store/actions'
import {
  creditAccountDeleteInProgress,
  creditAccountDetailsSelector,
  creditAccountsListErrorSelector,
  creditAccountsListSelector
} from '../store/creditAccounts'
import { useNormalTokens } from './useTokens'
import { RootState } from '../store/reducer'

export type CAListOutput = Record<string, CreditAccountData> | Error | null

function useAllCreditAccounts(): Record<string, CreditAccountData> | null {
  const casUnfiltered = useSelector(creditAccountsListSelector)
  return casUnfiltered
}

export function useCreditAccounts(): [CAListOutput, CAListOutput] {
  const dispatch = useDispatch()
  const { account, dataCompressor } = useSelector(
    (state: RootState) => state.web3
  )
  const caListUnfiltered = useAllCreditAccounts()
  const deleting = useSelector(creditAccountDeleteInProgress)
  const error = useSelector(creditAccountsListErrorSelector)

  useEffect(() => {
    if (account && dataCompressor) {
      //@ts-ignore
      dispatch(actions.creditAccounts.getList())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, dataCompressor === undefined])

  // !& mutation
  const caListWithDeleting = useMemo(() => {
    if (!caListUnfiltered) return caListUnfiltered
    Object.keys(deleting).forEach((addr) => {
      const ca = caListUnfiltered[addr]
      if (ca) ca.isDeleting = true
    })
    return caListUnfiltered
  }, [caListUnfiltered, deleting])

  const caList = useMemo(() => {
    if (!caListWithDeleting) return caListWithDeleting
    const filtered = Object.entries(caListWithDeleting).filter(
      ([, cm]) => cm.version === APP_VERSION
    )
    return Object.fromEntries(filtered)
  }, [caListWithDeleting])

  return [error || caList, error || caListUnfiltered]
}

export function useCreditAccount(
  creditManager: string | undefined
): CreditAccountData | undefined | Error {
  const dispatch = useDispatch()
  const { account, provider } = useSelector((state: RootState) => state.web3)
  const deleting = useSelector(creditAccountDeleteInProgress)

  const data = useSelector(creditAccountDetailsSelector(creditManager || ''))

  useEffect(() => {
    if (creditManager && account) {
      dispatch(
        //@ts-ignore
        actions.creditAccounts.getByCreditManager(creditManager, account)
      )
    }
  }, [account, creditManager, provider, dispatch])

  // !& mutation
  const result = useMemo(() => {
    if (!(data instanceof Error) && data) {
      data.isDeleting = deleting[data.creditManager]
    }

    return data
  }, [data, deleting])

  return result
}

export function useHasCAofTargetVersion(
  caList: CAListOutput,
  targetVersion: number
) {
  const hasTarget = useMemo(() => {
    if (caList instanceof Error) return false
    if (!caList) return false

    const hasSome = Object.values(caList).some(
      ({ version }) => version === targetVersion
    )

    return hasSome
  }, [caList, targetVersion])

  return hasTarget
}

export function useCreditAccountWithdrawLPList(
  ca: CreditAccountData,
  extraLPTokens: Array<string>,
  tokensList: Record<string, TokenData>
): Record<string, BigNumber> {
  const { balances: unfilteredBalances } = ca

  const normalBalances = useNormalTokens(unfilteredBalances)

  const extraBalances = useMemo(() => {
    const tokensOutList = extraLPTokens.map((tokenAddress) => {
      const { symbol } = tokensList[tokenAddress] || {}
      if (isLPToken(symbol)) {
        const tokensOut = getLPTokenOut(symbol)
        const tokenOutAddresses = tokensOut.map(
          (outSymbol) => currentTokenData[outSymbol]
        )
        return tokenOutAddresses
      }

      return []
    })
    const flattened = tokensOutList.flat(1)
    const unique = [...new Set(flattened)]

    const tokenOutBalances = unique.reduce<Record<string, BigNumber>>(
      (acc, tokenAddress) => {
        acc[tokenAddress] =
          unfilteredBalances[tokenAddress] || BigNumber.from(0)

        return acc
      },
      {}
    )

    return tokenOutBalances
  }, [extraLPTokens, tokensList, unfilteredBalances])

  const withDrawBalances = useMemo(
    () => ({ ...extraBalances, ...normalBalances }),
    [extraBalances, normalBalances]
  )

  return withDrawBalances
}

export function useCreditAccountAssets(
  ca: CreditAccountData,
  prices: Record<string, BigNumber>,
  tokensList: Record<string, TokenData>
): Array<Asset> {
  const assets = useMemo(() => {
    const sortedBalances = ca.balancesSorted(prices, tokensList)

    return sortedBalances.reduce<Array<Asset>>((acc, { token, balance }) => {
      acc.push({
        balance,
        token
      })
      return acc
    }, [])
  }, [ca, prices, tokensList])
  return assets
}

export function useOverallAPY({
  caAssets,
  lpAPY,
  prices,

  totalValue,
  debt,
  borrowRate,
  underlyingToken
}: CalcOverallAPYProps): number | undefined {
  const hexTotalValue = totalValue?.toHexString()
  const hexDebt = debt?.toHexString()

  const overallAPY = useMemo(() => {
    return calcOverallAPY({
      caAssets,
      lpAPY,
      prices,

      totalValue,
      debt,
      borrowRate,
      underlyingToken
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lpAPY,
    prices,
    caAssets,
    hexTotalValue,
    hexDebt,
    borrowRate,
    underlyingToken
  ])
  return overallAPY
}

interface UseMaxBorrowProps {
  hf: number
  debt: BigNumber
  cmMaxAmount: BigNumber
  maxLeverageFactor: number
}

export function useMaxBorrowAmount({
  hf,
  debt,
  cmMaxAmount,
  maxLeverageFactor
}: UseMaxBorrowProps): BigNumber {
  const amount = useMemo(() => {
    const maxAmountCalculated = calcMaxIncreaseBorrow(
      hf,
      debt,
      maxLeverageFactor
    )

    const maxAmount = maxAmountCalculated.add(debt).gt(cmMaxAmount)
      ? cmMaxAmount.sub(debt)
      : maxAmountCalculated

    return maxAmount
  }, [hf, debt, maxLeverageFactor, cmMaxAmount])

  return amount
}
