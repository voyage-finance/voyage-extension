/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { ethers } from 'ethers';
import { Voyage, Voyage__factory } from '@contracts';
import { ControllerStore } from './index';

class VoyageStore {
  root: ControllerStore;
  #voyage: Voyage;

  constructor(root: ControllerStore, voyageDiamondAddress: string) {
    this.root = root;
    this.#voyage = Voyage__factory.connect(
      voyageDiamondAddress,
      this.root.provider
    );
  }

  async getVault() {
    const { address } = await this.root.keyStore.getAccount();
    if (address === ethers.constants.AddressZero) return;

    const vault = await this.#voyage.getVault(address);
    if (vault === ethers.constants.AddressZero) return;

    return vault;
  }
}

export default VoyageStore;
