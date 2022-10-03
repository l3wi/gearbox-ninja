import {
  Asset,
  calcOverallAPY,
  CalcOverallAPYProps,
  CreditAccountData,
  CreditManagerData,
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

export function useCountCreditAccountAssets(
  assets: Array<Asset>,
  maxAmount: number
) {
  const count = useMemo(
    () =>
      assets.reduce((sum, { balance }) => {
        return balance.gte(2) ? sum + 1 : sum
      }, 0),
    [assets]
  )

  const closeToMax = maxAmount - 1
  const max = closeToMax > 0 ? closeToMax : 0
  return [count >= max, count]
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
  cm: CreditManagerData
}

export function useMaxBorrowAmount({
  hf,
  debt,
  cm
}: UseMaxBorrowProps): BigNumber {
  const amount = useMemo(() => {
    const underlyingTokenLT = cm.liquidationDiscount - cm.feeLiquidation

    const maxAmountCalculated = CreditAccountData.calcMaxIncreaseBorrow(
      hf,
      debt,
      cm.maxLeverageFactor,
      underlyingTokenLT
    )

    const maxAmount = maxAmountCalculated.add(debt).gt(cm.maxAmount)
      ? cm.maxAmount.sub(debt)
      : maxAmountCalculated

    return maxAmount
  }, [hf, debt, cm])

  return amount
}

// interface UseRewardProps {
//   creditAccount: CreditAccountData
//   creditManager: CreditManagerData
//   prices: Record<string, BigNumber>
//   tokensList: Record<string, TokenData>
// }

// export function useReward({
//   creditAccount,
//   creditManager,
//   prices,
//   tokensList
// }: UseRewardProps): [Array<RewardWithAsset> | null | undefined, BigNumber] {
//   const dispatch = useDispatch()
//   const rewardsList = useSelector(creditAccountReward(creditAccount.addr))
//   const { provider } = useSelector((state: RootState) => state.web3)

//   useEffect(() => {
//     if (provider) {
//       dispatch(
//         actions.creditAccounts.getRewards({
//           creditAccount,
//           creditManager
//         })
//       )
//     }
//   }, [creditAccount, creditManager, provider, dispatch])

//   const rewardWithAssets = useRewardToAssets({
//     rewardsList: rewardsList || EMPTY_ARRAY,

//     targetToken: creditAccount.underlyingToken,
//     prices,
//     tokensList
//   })

//   const totalReward = useMemo(() => {
//     return rewardWithAssets.reduce((sum, rewardPool) => {
//       const poolTotal = rewardPool.rewards.reduce((sum, asset) => {
//         return sum.add(asset.amountInTarget)
//       }, BigNumber.from(0))

//       return sum.add(poolTotal)
//     }, BigNumber.from(0))
//   }, [rewardWithAssets])

//   return [!rewardsList ? rewardsList : rewardWithAssets, totalReward]
// }
