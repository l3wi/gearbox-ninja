import * as web3 from './web3/actions'
import * as auth from './auth/actions'
import * as game from './game/actions'
import * as form from './form/actions'
import * as pools from './pools/actions'
import * as operations from './operations/actions'
import * as tokens from './operations/actions'
import * as sync from './sync/actions'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  web3,
  auth,
  game,
  form,
  pools,
  operations,
  tokens,
  sync
}
