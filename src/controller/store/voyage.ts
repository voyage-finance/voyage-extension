/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { ethers } from 'ethers';
import { Voyage, Voyage__factory } from '@contracts';
import { ControllerStore } from './index';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

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
    const { address } = (await this.root.keyStore.getAccount()) || {};
    if (!address || address === ethers.constants.AddressZero) return;

    const vault = await this.#voyage.getVault(address);
    if (vault === ethers.constants.AddressZero) return;

    return vault;
  }

  async computeCounterfactualAddress() {
    const account = await this.root.keyStore.getAccount();
    console.log('account', account);
    if (!account || account.address === ethers.constants.AddressZero) return;
    const salt = keccak256(toUtf8Bytes(account.email)).slice(0, 42);
    console.log('salt', salt, 'address', account.address);
    const vaultAddress = await this.#voyage.computeCounterfactualAddress(
      account.address,
      salt
    );
    return vaultAddress;
  }
}

export default VoyageStore;
