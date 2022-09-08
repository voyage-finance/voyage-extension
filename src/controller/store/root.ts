import WalletConnectStore from './wallet-connect';
import VoyageStore from './voyage';
import { ethers } from 'ethers';
import KeyStore from './key';
import TransactionStore from './transaction';
import { getNetworkConfiguration, VoyageContracts } from '@utils/env';
import { GsnStore } from 'controller/store/gsn';

class ControllerStore {
  provider: ethers.providers.Provider;
  gsnStore?: GsnStore;
  walletConnectStore: WalletConnectStore;
  voyageStore: VoyageStore;
  transactionStore: TransactionStore;
  keyStore: KeyStore;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.walletConnectStore = new WalletConnectStore(this);
    this.voyageStore = new VoyageStore(
      this,
      getNetworkConfiguration().contracts[VoyageContracts.Voyage]
    );
    this.keyStore = new KeyStore(this);
    this.transactionStore = new TransactionStore(this);
    this.gsnStore = new GsnStore(this);
  }

  get state() {
    return {
      ...this.walletConnectStore.state,
      ...this.keyStore.state,
      ...this.voyageStore.state,
      ...this.transactionStore.state,
    };
  }
}

export default ControllerStore;
