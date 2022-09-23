import { TransactionRequest } from '@ethersproject/providers';
import {
  ChainID,
  LOOKS_ADDRESS,
  Marketplace,
  SEAPORT_EXCHANGE_TESTNET,
} from '@utils/constants';
import { ethers } from 'ethers';
import browser from 'webextension-polyfill';
import ControllerStore from './root';
import { IControllerStore, OrderData } from './types';

class OrderStore implements IControllerStore {
  root: ControllerStore;

  constructor(root: ControllerStore) {
    this.root = root;
  }

  get api() {
    return {
      createOrder: this.createOrder.bind(this),
    };
  }

  createOrder = async (order: OrderData) => {
    console.log('getting calldata for order: ', order);
    const vault = await this.root.voyageStore.fetchVault();
    if (!vault) {
      console.error('could not fetch vault.');
      return;
    }

    const res = await fetch(
      `${process.env.VOYAGE_API_URL}/v1/marketplace/${order.marketplace}/order?collection=${order.collection}&tokenId=${order.tokenId}&receiver=${vault}`
    );
    const calldata = await res.json();
    console.log('order calldata: ', calldata);
    const marketplaceAddress = this._getMarketplaceAddress(order.marketplace);
    const tx: TransactionRequest = {
      from: vault,
      to: marketplaceAddress,
      data: calldata,
    };
    console.log('sending tx: ', tx);
    await this.root.transactionStore.addNewTransaction(
      tx,
      this.onSuccess,
      this.onReject
    );
    browser.tabs.create({ url: 'home.html' });
    return calldata;
  };

  onSuccess = async (hash: string) => {
    console.log('successfully dispatched order with tx hash: ', hash);
  };

  onReject = async () => {
    console.error('failed toa dd transaction');
  };

  _getMarketplaceAddress = (marketplace: string) => {
    const chainID = +process.env.CHAIN_ID! as ChainID;
    switch (marketplace) {
      case Marketplace.Looks:
        return LOOKS_ADDRESS[chainID];
      case Marketplace.Opensea:
        return SEAPORT_EXCHANGE_TESTNET;
      default:
        return ethers.constants.AddressZero;
    }
  };
}

export default OrderStore;
