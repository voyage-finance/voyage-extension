import WalletConnectStore from './wallet-connect';
import VoyageStore from './voyage';
import { ethers } from 'ethers';
import KeyStore from './key';

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
      // TODO: this should be retrieved from a remote server, or, at least, passed in via configuration.
      '0xf8e1932cdedf2D8b4cbA0Ece5D79BD4ad5033DfC'
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
