import {
  AdapterInterface,
  AdapterType,
  BaseAdapter,
  contractsByAddress,
  EVMTx,
  getConnectors,
  getNetworkType,
  IPathFinder,
  IPathFinder__factory,
  IUniswapV2Router02,
  IUniswapV2Router02__factory,
  TXSwap,
} from "@gearbox-protocol/sdk";
import { Signer } from "ethers";

type IUniswapV2Router02Interface = IUniswapV2Router02["interface"];

interface UniswapV2AdapterProps {
  name: string;
  router: IUniswapV2Router02;
  adapter: IUniswapV2Router02;
  pathFinder: string;
  signer: Signer;
  creditManager: string;
  netConnectors: Array<string>;
  wethToken: string;
}

export class UniswapV2Adapter extends BaseAdapter {
  readonly pathFinder: IPathFinder;
  readonly router: IUniswapV2Router02;
  readonly adapter: IUniswapV2Router02;
  readonly interface: IUniswapV2Router02Interface;
  readonly signer: Signer;
  readonly creditManager: string;
  readonly wethToken: string;
  readonly connectors: Array<string>;

  static async connectAdapter(
    name: string,
    routerAddress: string,
    adapterAddress: string,
    pathFinder: string,
    signer: Signer,
    creditManager: string,
    wethToken: string,
  ): Promise<UniswapV2Adapter> {
    const networkId = await signer.provider?.getNetwork();
    const networkType = getNetworkType(networkId?.chainId || 0);
    if (!networkType) {
      throw new Error("incorrect signer or provider");
    }

    const netConnectors = getConnectors(networkType);

    const router = IUniswapV2Router02__factory.connect(routerAddress, signer);
    const adapter = IUniswapV2Router02__factory.connect(adapterAddress, signer);

    return new UniswapV2Adapter({
      name,
      router,
      adapter,
      pathFinder,
      signer,
      creditManager,
      netConnectors,
      wethToken,
    });
  }

  protected constructor(props: UniswapV2AdapterProps) {
    super({
      name: props.name,
      type: AdapterType.Swap,
      adapterInterface: AdapterInterface.UNISWAP_V2_ROUTER,
      contractAddress: props.router.address,
      adapterAddress: props.adapter.address,
      contractSymbol: contractsByAddress[props.router.address],
    });

    this.pathFinder = IPathFinder__factory.connect(
      props.pathFinder,
      props.signer,
    );
    this.router = props.router;
    this.adapter = props.adapter;
    this.interface = IUniswapV2Router02__factory.createInterface();
    this.signer = props.signer;
    this.connectors = props.netConnectors;
    this.creditManager = props.creditManager;
    this.wethToken = props.wethToken;
  }

  async execute(props: Parameters<BaseAdapter["execute"]>[0]): Promise<EVMTx> {
    return {} as TXSwap;
  }
}
