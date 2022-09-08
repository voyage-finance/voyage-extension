import { TransactionParams } from 'types/transaction';
import { ControllerStore } from '../store';
import { nanoid } from 'nanoid';
import { openNotificationWindow } from '@utils/extension';
import { IClientMeta } from '@walletconnect/types';
import browser from 'webextension-polyfill';

/**
 * VoyageRpcService defines all handlers for eth RPC methods.
 * Used to implement the backing JsonRpcEngine of VoyageProvider.
 */
class VoyageRpcService {
  store: ControllerStore;
  constructor(store: ControllerStore) {
    this.store = store;
  }

  handleEthAccounts = async () => {
    const address = this.store.voyageStore.vaultAddress;
    return address ? [address] : [];
  };

  handleEthSendTx = async (txParams: TransactionParams) => {
    const newTx = this.store.transactionStore.addNewTransaction(txParams);
    browser.tabs.create({ url: 'home.html' });
    return newTx.hash;
  };

  handleEthSign = async (
    address: string,
    message: string,
    metadata: IClientMeta
  ) =>
    new Promise<string>((resolve, reject) => {
      const id = nanoid();
      this.store.transactionStore.addSignRequest({
        id,
        address,
        message,
        metadata,
        onApprove: async () =>
          resolve(await this.store.keyStore.signMessage(message)),
        onReject: async () => reject('User rejected session request'),
      });
      openNotificationWindow({
        url: 'notification.html',
        type: 'popup',
        width: 360,
        height: 600,
        left: 0,
        top: 0,
      });
    });
}

export default VoyageRpcService;
