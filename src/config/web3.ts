import { Web3State } from '../store/web3/reducer'
import { Wallets } from './connectors'

export interface Web3 extends Web3State {
  activate(walletId: Wallets): Promise<void>
  deactivate(): void
}
