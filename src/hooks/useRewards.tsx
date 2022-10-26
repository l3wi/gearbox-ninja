import {
  calcTotalPrice,
  DieselTokenTypes,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  tokenSymbolByAddress,
  toSignificant,
  WAD,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk";
import { GEAR_PER_BLOCK } from "@gearbox-protocol/sdk/lib/rewards/poolRewardParams";
import { BigNumber } from "ethers";

const BLOCKS_IN_YEAR = BigNumber.from((365 * 24 * 60 * 60) / 12);

interface GetFarmingAPYProps {
  gear: {
    price: BigNumber;
  };
  diesel: {
    token: string;
  };
  underlying: {
    price: BigNumber;
    decimals: number;
    amount: BigNumber;
  };
}

export function getFarmingAPY({
  underlying,
  gear,
  diesel,
}: GetFarmingAPYProps) {
  const supply = calcTotalPrice(
    underlying.price,
    underlying.amount,
    underlying.decimals,
  );
  if (supply.lte(0)) return 0;

  const dieselSymbol = tokenSymbolByAddress[diesel.token] as DieselTokenTypes;
  if (!dieselSymbol) return 0;

  const GEAR = GEAR_PER_BLOCK[dieselSymbol] || 0;

  const gearAmount = calcTotalPrice(gear.price, BLOCKS_IN_YEAR.mul(GEAR), 2);

  const apyBn = gearAmount.mul(WAD).div(supply);

  return Math.round(
    Number(
      toSignificant(
        apyBn.mul(PERCENTAGE_FACTOR).mul(PERCENTAGE_DECIMALS),
        WAD_DECIMALS_POW,
      ),
    ),
  );
}
