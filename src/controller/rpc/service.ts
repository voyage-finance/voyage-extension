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
}

export default VoyageRpcService;
