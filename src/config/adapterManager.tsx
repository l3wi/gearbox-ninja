import {
  AdapterInterface,
  BaseAdapter,
  ContractParams,
  contractParams,
  contractsByAddress,
  CreditManagerData,
  IPathFinder,
  IPathFinder__factory,
  SwapType,
  Trade
} from '@gearbox-protocol/sdk'
import { SwapTaskStruct } from '@gearbox-protocol/sdk/lib/types/contracts/pathfinder/interfaces/IPathFinder'
import { BigNumber, Signer } from 'ethers'

import { CurveAdapter } from './adapter/curve'
import { UniswapV2Adapter } from './adapter/uniswapV2'
import { UniswapV3Adapter } from './adapter/uniswapV3'
// import { YearnAdapter } from './adapter/yearn'
import { connectorTokenAddresses } from './tokens/tokenLists'

interface AdapterManagerProps {
  creditManager: CreditManagerData
  adapters: Array<BaseAdapter>
  wethToken: string
  signer: Signer
  pathFinder: string
  connectors: Array<string>
}

interface GetPathsProps {
  swapType: SwapType
  from: string
  to: string
  amount: BigNumber
  creditAccount: string
  slippage: number
}

export class AdapterManager {
  readonly id: string

  readonly pathFinder: IPathFinder

  readonly adapters: Record<string, BaseAdapter>

  readonly connectors: Array<string>

  readonly creditManager: CreditManagerData

  readonly tokens: Record<string, true>

  readonly wethToken: string

  readonly signer: Signer

  protected constructor({
    creditManager,
    adapters,
    wethToken,
    signer,
    pathFinder,
    connectors
  }: AdapterManagerProps) {
    this.id = creditManager.id.toLowerCase()
    this.adapters = adapters.reduce<Record<string, BaseAdapter>>((acc, a) => {
      acc[a.contractAddress.toLowerCase()] = a
      return acc
    }, {})
    this.connectors = connectors
    this.creditManager = creditManager
    this.wethToken = wethToken.toLowerCase()
    this.tokens = creditManager.allowedTokens.reduce<Record<string, true>>(
      (acc, t) => {
        acc[t.toLowerCase()] = true
        return acc
      },
      {}
    )
    this.signer = signer
    this.pathFinder = IPathFinder__factory.connect(pathFinder, signer)
  }

  static async connectAdapterManager({
    creditManager,
    pathFinder,
    signer,
    wethToken,
    connectors
  }: {
    creditManager: CreditManagerData
    pathFinder: string
    signer: Signer
    wethToken: string
    connectors: Array<string>
  }): Promise<AdapterManager> {
    const { adapters: cmAdapters } = creditManager

    const adaptersList = await Promise.all(
      Object.entries(cmAdapters).reduce<Array<Promise<BaseAdapter>>>(
        (acc, [contractAddr, adapterAddr]) => {
          const contractName = contractsByAddress[contractAddr]
          if (!contractName) {
            console.warn('Contract not found', contractAddr)
            return acc
          }

          const params = contractParams[contractName]
          if (!params) {
            console.warn('Contract params not found', contractName)
            return acc
          }

          const adapter = connectAdapter(
            contractAddr,
            adapterAddr,
            pathFinder,
            wethToken,
            params,
            creditManager,
            signer
          )

          if (adapter) acc.push(adapter)

          return acc
        },
        []
      )
    )

    return new AdapterManager({
      creditManager,
      adapters: adaptersList,
      wethToken,
      signer,
      pathFinder,
      connectors
    })
  }

  async findAllSwaps({
    swapType,
    from,
    to,
    amount,
    creditAccount,
    slippage
  }: GetPathsProps): Promise<Array<Trade>> {
    const started = Date.now()

    const struct: SwapTaskStruct = {
      swapOperation: swapType,
      creditAccount,
      tokenIn: from,
      tokenOut: to,
      connectors: connectorTokenAddresses,
      amount,
      slippage,
      externalSlippage: false
    }

    console.debug('TRADE PARAMS', struct)

    const results = await this.pathFinder.callStatic.findAllSwaps(struct)

    console.debug('findAllSwaps', results)

    const trades = results.reduce<Array<Trade>>((acc, tp) => {
      const { calls } = tp
      const adapterAddress = calls[0].target.toLowerCase()
      const adapter = this.adapters[adapterAddress]

      if (!adapter) console.debug('ADAPTER NOT FOUND', adapterAddress)

      if (adapter) acc.push(Trade.connect({ tradePath: tp, adapter }))

      return acc
    }, [])

    console.debug(`PATH FINDER: ${Date.now() - started}ms`)

    return trades
  }
}

function connectAdapter(
  contractAddr: string,
  adapterAddr: string,
  pathFinder: string,
  wethToken: string,
  cParams: ContractParams,
  creditManager: CreditManagerData,
  signer: Signer
) {
  const { name } = cParams
  const { address: cmAddress } = creditManager

  switch (cParams.type) {
    case AdapterInterface.UNISWAP_V2_ROUTER:
      return UniswapV2Adapter.connectAdapter(
        name,
        contractAddr,
        adapterAddr,
        pathFinder,
        signer,
        cmAddress,
        wethToken
      )
    case AdapterInterface.UNISWAP_V3_ROUTER:
      if (!cParams.quoter) throw new Error('incorrect quoter')
      return UniswapV3Adapter.connectAdapter(
        name,
        contractAddr,
        adapterAddr,
        cParams.quoter,
        pathFinder,
        signer,
        cmAddress,
        wethToken
      )
    case AdapterInterface.CURVE_V1_3ASSETS:
      return CurveAdapter.connectAdapter(
        name,
        contractAddr,
        adapterAddr,
        cParams.tokens,
        signer,
        cmAddress
      )
    // case AdapterInterface.YEARN_V2:
    //   return YearnAdapter.connectAdapter(
    //     name,
    //     contractAddr,
    //     adapterAddr,
    //     signer,
    //     cmAddress
    //   )
    default:
      return null
  }
}
