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
    try {
      const preview = await this.previewTx(txParams);
      browser.tabs.create({ url: 'home.html' });
      return this.store.transactionStore.addNewUnconfirmedTransaction(
        txParams,
        preview
      );
    } catch (e) {
      console.error('[tx preview] failed with error:', e);
    }
  };

  handleEthSign = async (
    address: string,
    message: string,
    metadata: IClientMeta
  ) =>
    new Promise<string>(async (resolve, reject) => {
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

  getUnconfirmedTransactions() {
    return this.store.transactionStore.getUnconfirmedTransactions();
  }

  private previewTx = async (txParams: TransactionParams) => {
    const response = await fetch(
      `${process.env.VOYAGE_API_URL}/v1/marketplace/preview/looksrare`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calldata: txParams.data,
          speed: 'fast',
          vault: this.store.voyageStore.vaultAddress,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      Promise.reject(data);
    }
    console.log('[tx preview]', data);
    return data;
  };
}

export default VoyageRpcService;
