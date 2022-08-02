import WalletConnectStore from './wallet-connect';
import VoyageStore from './voyage';
import { ethers } from 'ethers';
import KeyStore from './key';

const DEFAULT_VOYAGE_ADDRESS = '0xf8e1932cdedf2D8b4cbA0Ece5D79BD4ad5033DfC';

class ControllerStore {
  provider: ethers.providers.Provider;
  walletConnectStore: WalletConnectStore;
  voyageStore: VoyageStore;
  keyStore: KeyStore;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.walletConnectStore = new WalletConnectStore(this);
    this.voyageStore = new VoyageStore(
      this,
      process.env.VOYAGE_ADDRESS || DEFAULT_VOYAGE_ADDRESS
    );
    this.keyStore = new KeyStore(this);
  }

  get state() {
    return {
      ...this.walletConnectStore.state,
      ...this.keyStore.state,
    };
  }
}

export default ControllerStore;
