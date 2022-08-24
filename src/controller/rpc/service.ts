import { TransactionParams } from 'types/transaction';
import { ControllerStore } from '../store';

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
