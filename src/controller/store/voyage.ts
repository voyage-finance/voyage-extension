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
import { config } from '@utils/env';
import { ETHERS_DECIMALS } from '@utils/bn';

class VoyageStore {
  root: ControllerStore;
  vaultAddress?: string;
  storedWrapEthTx?: string;
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
    const storedWrapEthTx = (await storage.local.get('storedWrapEthTx'))
      .storedWrapEthTx as string | undefined;
    console.log('----VoyageStore [storedVault] -----', storedVault);
    console.log('----VoyageStore [storedWrapEthTx] -----', storedWrapEthTx);
    if (storedVault && storedVault !== ethers.constants.AddressZero) {
      this.vaultAddress = storedVault;
      browser.action.setPopup({ popup: 'popup.html' });
    }
    if (storedWrapEthTx) this.storedWrapEthTx = storedWrapEthTx;
  }

  get state() {
    return {
      vaultAddress: this.vaultAddress,
      storedWrapEthTx: this.storedWrapEthTx,
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
      repay: this.repay.bind(this),
      isCollectionSupported: this.isCollectionSupported.bind(this),
      getPaymasterAddr: this.getPaymasterAddr.bind(this),
      transferCurrency: this.transferCurrency.bind(this),
      transferETH: this.transferETH.bind(this),
      withdrawNFT: this.withdrawNFT.bind(this),
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

  async isCollectionSupported(colleciton: string) {
    const supprotedCollections = await this.voyage.getCollections();
    console.log('supproted collections', supprotedCollections);
    return (
      supprotedCollections.findIndex(
        (value) => value.toLowerCase() == colleciton.toLowerCase()
      ) > -1
    );
  }

  async getPaymasterAddr() {
    const paymasterAddress = await this.voyage.getPaymasterAddr();
    console.log('paymasterAddress', paymasterAddress);
    return paymasterAddress.toLowerCase();
  }

  async computeCounterfactualAddress() {
    const account = await this.root.keyStore.getAccount();
    if (!account || account.address === ethers.constants.AddressZero) return;
    const salt = keccak256(toUtf8Bytes(account.email)).slice(0, 42);
    console.log('salt', salt, 'address', account.address);
    const vaultAddress = await this.voyage.computeCounterfactualAddress(
      account.address!,
      salt
    );
    return vaultAddress;
  }

  _setstoredWrapEthTx(value: any) {
    console.log('[storedWrapEthTx] setting to ', value);

    this.storedWrapEthTx = value;
    storage.local.set({
      storedWrapEthTx: this.storedWrapEthTx,
    });
  }

  async wrapVaultETH(amount: BigNumber) {
    try {
      this._setstoredWrapEthTx('initializing');
      const txRequest = await this.voyage.populateTransaction.wrapVaultETH(
        this.vaultAddress!,
        amount.toString()
      );
      const tx = await this.root.gsnStore.relayTransaction(txRequest);
      this._setstoredWrapEthTx(tx.hash);
      return tx.hash;
    } catch (e: any) {
      console.error('[wrapVaultETH]', e);

      this._setstoredWrapEthTx(undefined);
      throw new Error(e.message);
    }
  }

  async repay(colleciton: string, loanId: number) {
    try {
      const txRequest = await this.voyage.populateTransaction.repay(
        colleciton,
        loanId,
        this.vaultAddress!
      );

      const tx = await this.root.gsnStore.relayTransaction(txRequest);
      const { transactionHash } = await tx.wait(config.numConfirmations);
      return transactionHash;
    } catch (e: any) {
      console.error('[repay]', e);
      throw new Error(e.message);
    }
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

  async transferCurrency(
    vault: string,
    currency: string,
    to: string,
    amount: string
  ) {
    try {
      console.log('transferCurrency params', {
        vault,
        currency,
        to,
        amount: new BigNumber(amount).shiftedBy(ETHERS_DECIMALS).toString(),
      });

      const txRequest = await this.voyage.populateTransaction.transferCurrency(
        vault,
        currency,
        to,
        new BigNumber(amount).shiftedBy(ETHERS_DECIMALS).toString()
      );

      const tx = await this.root.gsnStore.relayTransaction(txRequest);
      return tx.hash;
    } catch (e: any) {
      console.error('[transferCurrency]', e);
      throw new Error(e.message);
    }
  }

  async transferETH(vault: string, to: string, amount: string) {
    try {
      console.log('transferETH params', {
        vault,
        to,
        amount: new BigNumber(amount).shiftedBy(ETHERS_DECIMALS).toString(),
      });

      const txRequest = await this.voyage.populateTransaction.transferETH(
        vault,
        to,
        new BigNumber(amount).shiftedBy(ETHERS_DECIMALS).toString()
      );

      const tx = await this.root.gsnStore.relayTransaction(txRequest);
      return tx.hash;
    } catch (e: any) {
      console.error('[transferETH]', e);
      throw new Error(e.message);
    }
  }

  async withdrawNFT(
    vault: string,
    collection: string,
    tokenId: string,
    to: string
  ) {
    try {
      console.log('withdrawNFT params', {
        vault,
        collection,
        to,
        tokenId,
      });

      const txRequest = await this.voyage.populateTransaction.withdrawNFT(
        vault,
        collection,
        to,
        tokenId
      );

      const tx = await this.root.gsnStore.relayTransaction(txRequest);
      return tx.hash;
    } catch (e: any) {
      console.error('[withdrawNFT]', e);
      throw new Error(e.message);
    }
  }

  async approveMarketplaceAddress(address: string) {
    const txRequest = await this.voyage.populateTransaction.approveMarketplace(
      this.vaultAddress!,
      address,
      false
    );
    const tx = await this.root.gsnStore.relayTransaction(txRequest);
    const { transactionHash } = await tx.wait(config.numConfirmations);
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
