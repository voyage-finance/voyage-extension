/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { BytesLike, ethers } from 'ethers';
import { Voyage, Voyage__factory } from '@contracts';
import { ControllerStore } from './index';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { makeAutoObservable, runInAction } from 'mobx';
import { Listener, TransactionRequest } from '@ethersproject/providers';
import { decodeMarketplaceCalldata } from '@utils/decoder';
import { storage } from 'webextension-polyfill';

class VoyageStore {
  root: ControllerStore;
  vaultAddress?: string;
  voyage: Voyage;

  constructor(root: ControllerStore, voyageDiamondAddress: string) {
    this.root = root;
    this.voyage = Voyage__factory.connect(
      voyageDiamondAddress,
      this.root.provider
    );
    makeAutoObservable(this, { root: false, voyage: false });
    this.initialize();
  }

  async initialize() {
    const storedVault = (await storage.local.get('vaultAddress'))
      .vaultAddress as string | undefined;
    console.log('----VoyageStore [storedVault] -----', storedVault);
    if (storedVault) {
      this.vaultAddress = storedVault;
    }
  }

  get state() {
    return {
      vaultAddress: this.vaultAddress,
    };
  }

  persistState() {
    storage.local.set({
      vaultAddress: this.vaultAddress,
    });
  }

  async fetchVault() {
    const { address } = (await this.root.keyStore.getAccount()) || {};
    if (!address || address === ethers.constants.AddressZero) return;

    const vaultAddress = await this.voyage.getVault(address);
    runInAction(() => {
      this.vaultAddress = vaultAddress;
    });
    this.persistState();
    console.log(
      '🚀 ~ file: voyage.ts ~ line 33 ~ VoyageStore ~ fetchVault ~ vaultAddress & user address',
      vaultAddress,
      address
    );

    if (vaultAddress === ethers.constants.AddressZero) return;
    return vaultAddress;
  }

  async computeCounterfactualAddress() {
    const account = await this.root.keyStore.getAccount();
    if (!account || account.address === ethers.constants.AddressZero) return;
    const salt = keccak256(toUtf8Bytes(account.email)).slice(0, 42);
    console.log('salt', salt, 'address', account.address);
    const vaultAddress = await this.voyage.computeCounterfactualAddress(
      account.address,
      salt
    );
    return vaultAddress;
  }

  async buyNow(transaction: TransactionRequest) {
    const { marketplace, collection, tokenId, data } =
      decodeMarketplaceCalldata(transaction);

    console.log('buyNow params', {
      collection,
      tokenId,
      vaultAddress: this.vaultAddress!,
      marketplace,
      data,
    });

    const txRequest = await this.voyage.populateTransaction.buyNow(
      collection,
      tokenId,
      this.vaultAddress!,
      marketplace,
      data
    );
    return this.root.gsnStore.relayTransaction(txRequest);
  }

  async populateBuyNow(
    _collection: string,
    _tokenId: string,
    _vault: string,
    _marketplace: string,
    _data: BytesLike
  ) {
    return this.voyage.populateTransaction.buyNow(
      _collection,
      _tokenId,
      _vault,
      _marketplace,
      _data
    );
  }

  getBalance(address: string) {
    return this.root.provider.getBalance(address);
  }

  listenVaultCreate(cb: Listener) {
    this.voyage.on('VaultCreated', cb);
  }
}

export default VoyageStore;
