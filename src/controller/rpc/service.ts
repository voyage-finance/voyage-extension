import { ControllerStore } from '../store';
import { nanoid } from 'nanoid';
import { openNotificationWindow } from '@utils/extension';
import { IClientMeta } from '@walletconnect/types';
import browser from 'webextension-polyfill';
import { TransactionRequest } from '@ethersproject/providers';
import { ApprovalType } from 'types';
import { config } from '@utils/env';

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

  handleEthSendTx = async (txParams: TransactionRequest) => {
    return new Promise<string>((resolve, reject) => {
      this.store.transactionStore.addNewTransaction(
        txParams,
        async (hash: string) => {
          console.log('transaction approved with hash', hash);
          resolve(hash);
        },
        async () => reject('User rejected session request')
      );
      browser.tabs.create({ url: 'home.html' });
    });
  };

  handleEthSign = async (
    address: string,
    message: string,
    metadata: IClientMeta
  ) =>
    new Promise<string>((resolve, reject) => {
      const id = nanoid();
      this.store.walletConnectStore.addApprovalRequest({
        id,
        type: ApprovalType.SIGN_MESSAGE,
        metadata: {
          address,
          message,
        },
        client: metadata,
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

  handleApproveMarketplace = async (calldata: string, client: IClientMeta) =>
    new Promise<string>((resolve, reject) => {
      const id = nanoid();
      this.store.walletConnectStore.addApprovalRequest({
        id,
        type: ApprovalType.APPROVE_MARKETPLACE,
        client,
        metadata: {
          calldata,
        },
        onApprove: async () => {
          const approveTx = await this.store.voyageStore.approveMarketplace(
            calldata
          );
          const receipt = await approveTx.wait(config.numConfirmations);
          resolve(receipt.transactionHash);
        },
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
