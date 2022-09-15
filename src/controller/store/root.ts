import WalletConnectStore from './wallet-connect';
import VoyageStore from './voyage';
import { ethers } from 'ethers';
import KeyStore from './key';
import TransactionStore from './transaction';
import { getNetworkConfiguration, Contracts } from '@utils/env';
import { GsnStore } from 'controller/store/gsn';
import { VoyageController } from '../index';
import { makeAutoObservable } from 'mobx';

class ControllerStore {
  controller: VoyageController;
  provider: ethers.providers.Provider;
  gsnStore: GsnStore;
  walletConnectStore: WalletConnectStore;
  voyageStore: VoyageStore;
  transactionStore: TransactionStore;
  keyStore: KeyStore;

  constructor(
    provider: ethers.providers.Provider,
    controller: VoyageController
  ) {
    this.controller = controller;
    this.provider = provider;
    this.walletConnectStore = new WalletConnectStore(this);
    this.voyageStore = new VoyageStore(
      this,
      getNetworkConfiguration().contracts[Contracts.Voyage]
    );
    this.gsnStore = new GsnStore(this);
    this.keyStore = new KeyStore(this);
    this.transactionStore = new TransactionStore(this);
    makeAutoObservable(this, { controller: false });
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
