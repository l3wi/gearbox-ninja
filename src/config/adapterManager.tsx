import {
  BaseAdapter,
  contractParams,
  contractsByAddress,
  CreditAccountData,
  CreditManagerData,
  ICreditFacade,
  ICreditFacade__factory,
  isSupportedContract,
  PathFinder,
  SupportedContract,
  SwapOperation,
  Trade,
  TxParser
} from '@gearbox-protocol/sdk'
import { MultiCall } from '@gearbox-protocol/sdk/lib/pathfinder/core'
import { BigNumber, Signer } from 'ethers'

import { captureException } from '../utils/errors'
import { currentContractsData } from './contracts'

interface AdapterManagerProps {
  creditManager: CreditManagerData
  signer: Signer
  pathFinder: PathFinder
}

export interface GetOneTokenPathProps {
  from: string
  to: string
  amount: BigNumber
  creditAccount: CreditAccountData
  slippage: number
}

export interface GetPathsProps extends GetOneTokenPathProps {
  swapType: SwapOperation
}

export class AdapterManager {
  readonly id: string
  readonly pathFinder: PathFinder
  readonly creditFacade: ICreditFacade
  readonly adapters: Record<string, BaseAdapter>
  readonly creditManager: CreditManagerData
  constructor({ creditManager, signer, pathFinder }: AdapterManagerProps) {
    const { creditFacade: creditFacadeAddress, adapters } = creditManager

    this.id = creditManager.id.toLowerCase()
    this.creditManager = creditManager

    this.adapters = Object.entries(adapters).reduce<
      Record<string, BaseAdapter>
    >((acc, [contractAddress, adapterAddress]) => {
      const contractSymbol = contractsByAddress[contractAddress]
      if (!contractSymbol) {
        console.error('Contract not found', contractAddress)
        return acc
      }

      const params = contractParams[contractSymbol]

      acc[contractAddress] = new BaseAdapter({
        name: params.name,
        adapterInterface: params.type,
        contractAddress,
        adapterAddress,
        contractSymbol,
        creditManager: creditManager.address
      })

      return acc
    }, {})

    this.creditFacade = ICreditFacade__factory.connect(
      creditFacadeAddress,
      signer
    )
    this.pathFinder = pathFinder
  }

  async findAllSwaps({
    swapType,
    from,
    to,
    amount,
    creditAccount,
    slippage
  }: GetPathsProps): Promise<Array<Trade>> {
    try {
      const results = await this.pathFinder.findAllSwaps(
        creditAccount,
        swapType,
        from,
        to,
        amount,
        slippage
      )

      const trades = results.reduce<Array<Trade>>((acc, tradePath) => {
        const { calls } = tradePath
        const callAdapters = getCallAdapters(
          calls,
          this.adapters,
          this.creditManager
        )

        const trade = new Trade({
          tradePath,
          creditFacade: this.creditFacade,
          adapter: callAdapters[0],
          swapType: SwapOperation.EXACT_INPUT,
          sourceAmount: amount,
          expectedAmount: tradePath.amount,
          tokenFrom: from,
          tokenTo: to,
          operationName: Trade.getOperationName(from, to)
        })

        acc.push(trade)

        return acc
      }, [])

      return sortTrades(trades, '')
    } catch (e: any) {
      captureException(
        'adapterManager/findOneTokenPath',
        'Cant get single trade path',
        e
      )
      return []
    }
  }

  async findOneTokenPath({
    from,
    to,
    amount,
    creditAccount,
    slippage
  }: GetOneTokenPathProps): Promise<Trade | undefined> {
    try {
      const tradePath = await this.pathFinder.findOneTokenPath(
        creditAccount,
        from,
        to,
        amount,
        slippage
      )

      const callAdapters = getCallAdapters(
        tradePath.calls,
        this.adapters,
        this.creditManager
      )

      const trade = new Trade({
        tradePath,
        creditFacade: this.creditFacade,
        adapter: callAdapters[0],
        swapType: SwapOperation.EXACT_INPUT,
        sourceAmount: amount,
        expectedAmount: tradePath.amount,
        tokenFrom: from,
        tokenTo: to,
        operationName: Trade.getOperationName(from, to)
      })

      return trade
    } catch (e: any) {
      captureException(
        'adapterManager/findOneTokenPath',
        'Cant get single trade path',
        e
      )
      return undefined
    }
  }
}

function getCallAdapters(
  calls: Array<MultiCall>,
  adapters: Record<string, BaseAdapter>,
  cm: CreditManagerData
) {
  const callAdapters = calls.reduce<Array<BaseAdapter>>((acc, call) => {
    const { contract: contractSymbol } = TxParser.getParseData(call.target)
    if (!isSupportedContract(contractSymbol)) return acc

    const contractAddress = currentContractsData[contractSymbol]
    const adapter =
      adapters[contractAddress] || connectAdapter(contractSymbol, cm)

    acc.push(adapter)

    return acc
  }, [])

  return callAdapters
}

function connectAdapter(
  contractSymbol: SupportedContract,
  cm: CreditManagerData
) {
  const { name, type } = contractParams[contractSymbol]
  const contractAddress = currentContractsData[contractSymbol]

  return new BaseAdapter({
    name,
    adapterInterface: type,
    adapterAddress: '',
    contractAddress,
    contractSymbol,
    creditManager: cm.address
  })
}

function sortTrades(trades: Array<Trade>, swapStrategy: string) {
  if (trades.length === 0) return []

  const { swapType } = trades[0]

  const sorted = trades.sort((a, b) => {
    const aSelected =
      a.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0
    const bSelected =
      b.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0

    if ((aSelected && bSelected) || (!aSelected && !bSelected)) {
      const sign = a.expectedAmount.gt(b.expectedAmount) ? -1 : 1
      return swapType === SwapOperation.EXACT_INPUT ? sign : -sign
    }

    return aSelected ? -1 : 1
  })

  return sorted
}
