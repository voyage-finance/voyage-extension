import { TransactionParams } from 'types/transaction';
import { ControllerStore } from '../store';
import { nanoid } from 'nanoid';
import { openNotificationWindow } from '@utils/extension';
import { IClientMeta } from '@walletconnect/types';

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
    if (await this.isValidTx(txParams))
      return this.store.transactionStore.addNewUnconfirmedTransaction(txParams);
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

  private isValidTx = async (txParams: TransactionParams) => {
    const previewResponse = await fetch(
      `${process.env.VOYAGE_API_URL}/marketplace/preview/opensea?calldata=${txParams.data}&speed=fast`
    );
    const isSupported = previewResponse.status === 200;
    return isSupported;
  };
}

export default VoyageRpcService;
