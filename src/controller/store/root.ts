import { config } from '@utils/env';
import { GsnStore } from 'controller/store/gsn';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { VoyageController } from '../index';
import KeyStore from './key';
import OrderStore from './order';
import TransactionStore from './transaction';
import VoyageStore from './voyage';
import WalletConnectStore from './wallet-connect';

class ControllerStore {
  controller: VoyageController;
  provider: ethers.providers.Provider;
  gsnStore: GsnStore;
  walletConnectStore: WalletConnectStore;
  voyageStore: VoyageStore;
  transactionStore: TransactionStore;
  keyStore: KeyStore;
  orderStore: OrderStore;

  constructor(
    provider: ethers.providers.Provider,
    controller: VoyageController
  ) {
    this.controller = controller;
    this.provider = provider;
    this.walletConnectStore = new WalletConnectStore(this);
    this.voyageStore = new VoyageStore(this, config.voyage);
    this.gsnStore = new GsnStore(this);
    this.keyStore = new KeyStore(this);
    this.transactionStore = new TransactionStore(this);
    this.orderStore = new OrderStore(this);
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
