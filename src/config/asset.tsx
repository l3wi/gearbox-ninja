import { Asset } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";

export interface AssetWithView extends Asset {
  balanceView: string;
}

export interface AssetWithAmountInTarget extends Asset {
  amountInTarget: BigNumber;
}
