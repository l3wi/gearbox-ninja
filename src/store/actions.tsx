import * as creditAccounts from "./creditAccounts/actions";
import * as creditManagers from "./creditManagers/actions";
import * as form from "./form/actions";
import * as game from "./game/actions";
import * as operations from "./operations/actions";
import * as pools from "./pools/actions";
import * as price from "./prices/actions";
import * as strategy from "./strategy/actions";
import * as sync from "./sync/actions";
import * as tokens from "./tokens/actions";
import { Web3Actions } from "./web3";
import * as web3 from "./web3/actions";

const actions = {
  web3,
  game,
  form,
  pools,
  operations,
  strategy,
  tokens,
  price,
  sync,
  creditAccounts,
  creditManagers,
};

export default actions;
