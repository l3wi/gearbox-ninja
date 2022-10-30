import {
  contractsByNetwork,
  keyToLowercase,
  swapKeyValue,
} from "@gearbox-protocol/sdk";

import { CHAIN_TYPE } from "../config";

export const currentContractsData = swapKeyValue(
  keyToLowercase(swapKeyValue(contractsByNetwork[CHAIN_TYPE]))
);
