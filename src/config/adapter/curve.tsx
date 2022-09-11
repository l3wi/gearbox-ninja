import {
  AdapterInterface,
  AdapterType,
  BaseAdapter,
  callRepeater,
  contractsByAddress,
  EVMTx,
  ICurvePool,
  ICurvePool__factory,
  MultiCallContract,
} from "@gearbox-protocol/sdk";
import { Signer } from "ethers";

type ICurvePoolInterface = ICurvePool["interface"];

interface CurveAdapterProps {
  name: string;
  router: ICurvePool;
  adapter: ICurvePool;
  signer: Signer;
  tokens: Record<string, number>;
  numToTokens: Record<number, string>;
  creditManager: string;
}

export class CurveAdapter extends BaseAdapter {
  readonly router: ICurvePool;
  readonly adapter: ICurvePool;
  readonly interface: ICurvePoolInterface;
  readonly signer: Signer;
  readonly creditManager: string;
  readonly numToTokens: Record<number, string>;
  protected tokens: Record<string, number>;

  protected constructor(props: CurveAdapterProps) {
    super({
      name: props.name,
      type: AdapterType.Swap,
      adapterInterface: AdapterInterface.CURVE_V1_3ASSETS,
      contractAddress: props.router.address,
      adapterAddress: props.adapter.address,
      contractSymbol: contractsByAddress[props.router.address],
    });

    this.router = props.router;
    this.adapter = props.adapter;
    this.interface = ICurvePool__factory.createInterface();
    this.signer = props.signer;
    this.tokens = props.tokens;
    this.numToTokens = props.numToTokens;
    this.creditManager = props.creditManager;
  }

  static async connectAdapter(
    name: string,
    routerAddress: string,
    adapterAddress: string,
    coinsList: Array<string>,
    signer: Signer,
    creditManager: string,
  ): Promise<CurveAdapter> {
    const poolContract = new MultiCallContract(
      adapterAddress,
      ICurvePool__factory.createInterface(),
      signer.provider!,
    );

    const coinAddresses = await callRepeater(() =>
      poolContract.call<Array<string>>(
        coinsList.map((_, index) => ({
          method: "coins(uint256)",
          params: [index],
        })),
      ),
    );

    const [tokens, numToTokens] = coinAddresses.reduce<
      [Record<string, number>, Record<number, string>]
    >(
      ([tokensAcc, numToTokensAcc], token, index) => {
        // eslint-disable-next-line no-param-reassign
        tokensAcc[token.toLowerCase()] = index;
        // eslint-disable-next-line no-param-reassign
        numToTokensAcc[index] = token.toLowerCase();

        return [tokensAcc, numToTokensAcc];
      },
      [{}, {}],
    );

    const router = ICurvePool__factory.connect(routerAddress, signer);
    const adapter = ICurvePool__factory.connect(adapterAddress, signer);

    return new CurveAdapter({
      name,
      router,
      adapter,
      signer,
      tokens,
      numToTokens,
      creditManager,
    });
  }

  async execute(props: Parameters<BaseAdapter["execute"]>[0]): Promise<EVMTx> {
    return {} as EVMTx;
  }
}
