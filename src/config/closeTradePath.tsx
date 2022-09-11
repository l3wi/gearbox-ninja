import { PathFinderResultStructOutput } from "@gearbox-protocol/sdk/lib/types/contracts/pathfinder/interfaces/IPathFinder";

export type TradePath = PathFinderResultStructOutput;

export type CloseTradePathExtended = TradePath & {
  address: string;
};
