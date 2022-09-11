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
  IQuoter,
  IQuoter__factory,
  ISwapRouter,
  ISwapRouter__factory,
} from "@gearbox-protocol/sdk";
import { Signer } from "ethers";

type ISwapRouterInterface = ISwapRouter["interface"];

interface UniswapV3AdapterProps {
  name: string;
  router: ISwapRouter;
  adapter: ISwapRouter;
  quoter: IQuoter;
  pathFinder: string;
  netConnectors: Array<string>;
  signer: Signer;
  creditManager: string;
  wethToken: string;
}

export class UniswapV3Adapter extends BaseAdapter {
  readonly router: ISwapRouter;
  readonly adapter: ISwapRouter;
  readonly quoter: IQuoter;
  readonly pathFinder: IPathFinder;
  readonly interface: ISwapRouterInterface;
  readonly signer: Signer;
  readonly creditManager: string;
  readonly connectors: Array<string>;
  readonly wethToken: string;

  protected constructor(props: UniswapV3AdapterProps) {
    super({
      name: props.name,
      type: AdapterType.Swap,
      adapterInterface: AdapterInterface.UNISWAP_V3_ROUTER,
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
    this.interface = ISwapRouter__factory.createInterface();
    this.signer = props.signer;
    this.quoter = props.quoter;
    this.connectors = props.netConnectors;
    this.creditManager = props.creditManager;
    this.wethToken = props.wethToken;
  }

  static async connectAdapter(
    name: string,
    routerAddress: string,
    adapterAddress: string,
    iQuoter: string,
    pathFinder: string,
    signer: Signer,
    creditManager: string,
    wethToken: string,
  ): Promise<UniswapV3Adapter> {
    const networkId = await signer.provider?.getNetwork();
    const networkType = getNetworkType(networkId?.chainId || 0);
    if (!networkType) {
      throw new Error("incorrect signer or provider");
    }

    const netConnectors = getConnectors(networkType);
    const quoter = IQuoter__factory.connect(iQuoter, signer);

    const router = ISwapRouter__factory.connect(routerAddress, signer);
    const adapter = ISwapRouter__factory.connect(adapterAddress, signer);

    return new UniswapV3Adapter({
      name,
      router,
      adapter,
      quoter,
      pathFinder,
      netConnectors,
      signer,
      creditManager,
      wethToken,
    });
  }

  async execute(props: Parameters<BaseAdapter["execute"]>[0]): Promise<EVMTx> {
    return {} as EVMTx;
  }
}
