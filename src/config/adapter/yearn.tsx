import {
  AdapterInterface,
  AdapterType,
  AwaitedRes,
  BaseAdapter,
  callRepeater,
  contractsByAddress,
  EVMTx,
  IYVault,
  IYVault__factory,
  MCall,
  multicall,
  TXSwap,
} from "@gearbox-protocol/sdk";
import { YearnV2Adapter } from "@gearbox-protocol/sdk/lib/types/contracts/adapters/yearn/YearnV2.sol/YearnV2Adapter";
import { YearnV2Adapter__factory } from "@gearbox-protocol/sdk/lib/types/factories/contracts/adapters/yearn/YearnV2.sol/YearnV2Adapter__factory";
import { BigNumber, Signer } from "ethers";

type IYVaultInterface = IYVault["interface"];
type YearnV2AdapterInterface = YearnV2Adapter["interface"];

interface YearnAdapterProps {
  name: string;
  vault: IYVault;
  adapter: string;
  token: string;
  yToken: string;
  decimals: number;
  signer: Signer;
  creditManager: string;
}

export class YearnAdapter extends BaseAdapter {
  readonly vault: IYVault;
  readonly interface: IYVaultInterface;
  readonly signer: Signer;
  readonly token: string;
  readonly adapter: string;
  readonly yVault: string;
  readonly decimals: number;
  readonly creditManager: string;
  protected decimalsMul: BigNumber;

  protected constructor(props: YearnAdapterProps) {
    super({
      name: props.name,
      type: AdapterType.LP,
      adapterInterface: AdapterInterface.YEARN_V2,
      contractAddress: props.vault.address,
      adapterAddress: props.adapter,
      contractSymbol: contractsByAddress[props.vault.address],
    });

    this.vault = props.vault;
    this.adapter = props.adapter;
    this.interface = IYVault__factory.createInterface();
    this.token = props.token.toLowerCase();
    this.decimals = props.decimals;
    this.yVault = props.yToken.toLowerCase();
    this.decimalsMul = BigNumber.from(10).pow(props.decimals);
    this.signer = props.signer;
    this.creditManager = props.creditManager;
  }

  static async connectAdapter(
    name: string,
    yTokenAddress: string,
    adapter: string,
    signer: Signer,
    creditManager: string,
  ): Promise<YearnAdapter> {
    try {
      const calls: [
        MCall<YearnV2AdapterInterface>,
        MCall<YearnV2AdapterInterface>,
      ] = [
        {
          address: adapter,
          interface: YearnV2Adapter__factory.createInterface(),
          method: "token()",
        },
        {
          address: adapter,
          interface: YearnV2Adapter__factory.createInterface(),
          method: "decimals()",
        },
      ];

      const [token, decimals] = await callRepeater(() =>
        multicall<
          [
            AwaitedRes<YearnV2Adapter["token"]>,
            AwaitedRes<YearnV2Adapter["decimals"]>,
          ]
        >(calls, signer.provider!),
      );

      const yVault = IYVault__factory.connect(yTokenAddress, signer);

      return new YearnAdapter({
        name,
        vault: yVault,
        adapter,
        token,
        yToken: yTokenAddress,
        decimals: BigNumber.from(decimals).toNumber(),
        signer,
        creditManager,
      });
    } catch (e) {
      throw new Error("YearnAdapter: cant getAdapter");
    }
  }

  async execute(props: Parameters<BaseAdapter["execute"]>[0]): Promise<EVMTx> {
    return {} as TXSwap;
  }
}
