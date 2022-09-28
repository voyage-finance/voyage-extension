/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { BytesLike, ethers } from 'ethers';
import { Voyage, Voyage__factory } from '@contracts';
import { ControllerStore } from './index';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { makeAutoObservable, runInAction } from 'mobx';
import { Listener, TransactionRequest } from '@ethersproject/providers';
import {
  decodeMarketplaceFromApproveCalldata,
  decodeMarketplaceCalldata,
} from '@utils/decoder';
import { storage } from 'webextension-polyfill';
import BigNumber from 'bignumber.js';
import browser from 'webextension-polyfill';

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
    if (storedVault && storedVault !== ethers.constants.AddressZero) {
      this.vaultAddress = storedVault;
      browser.action.setPopup({ popup: 'popup.html' });
    }
  }

  get state() {
    return {
      vaultAddress: this.vaultAddress,
    };
  }

  get api() {
    return {
      wrapVaultETH: this.wrapVaultETH.bind(this),
      computeCounterfactualAddress:
        this.computeCounterfactualAddress.bind(this),
      populateBuyNow: this.populateBuyNow.bind(this),
      getBalance: this.getBalance.bind(this),
      fetchVault: this.fetchVault.bind(this),
      approveMarketplaceAddress: this.approveMarketplaceAddress.bind(this),
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
    // if we have vault, we always should show popup extension
    browser.action.setPopup({ popup: 'popup.html' });
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

  async wrapVaultETH(amount: BigNumber) {
    return await this.voyage
      .connect(this.root.keyStore.getSigner())
      .wrapVaultETH(this.vaultAddress!, amount.toString());
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

  async approveMarketplaceAddress(address: string) {
    const txRequest = await this.voyage.populateTransaction.approveMarketplace(
      this.vaultAddress!,
      address,
      false
    );
    const tx = await this.root.gsnStore.relayTransaction(txRequest);
    const { transactionHash } = await tx.wait(+process.env.NUM_CONFIRMATIONS!);
    return transactionHash;
  }

  async approveMarketplace(calldata: string) {
    const marketplace = decodeMarketplaceFromApproveCalldata(calldata);

    console.log('approveMarketplace params', {
      vaultAddress: this.vaultAddress!,
      marketplace,
    });

    const txRequest = await this.voyage.populateTransaction.approveMarketplace(
      this.vaultAddress!,
      marketplace,
      false
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
