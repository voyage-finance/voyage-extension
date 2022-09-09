/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { BytesLike, ethers } from 'ethers';
import { Voyage, Voyage__factory } from '@contracts';
import { ControllerStore } from './index';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { makeAutoObservable, runInAction } from 'mobx';
import { Listener, TransactionRequest } from '@ethersproject/providers';
import { ABIs } from '@utils/abis';
import { Contracts, getContractByAddress } from '@utils/env';

interface BuyNowParams {
  marketplace: string;
  collection: string;
  tokenId: ethers.BigNumber;
}

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
  }

  get state() {
    return {
      vaultAddress: this.vaultAddress,
    };
  }

  async fetchVault() {
    const { address } = (await this.root.keyStore.getAccount()) || {};
    if (!address || address === ethers.constants.AddressZero) return;

    const vaultAddress = await this.voyage.getVault(address);
    runInAction(() => {
      this.vaultAddress = vaultAddress;
    });
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
    const { marketplace, collection, tokenId } =
      this.decodeMarketplaceCalldata(transaction);
    const txRequest = await this.voyage.populateTransaction.buyNow(
      collection,
      tokenId,
      this.vaultAddress!,
      marketplace,
      transaction.data!
    );
    return this.root.gsnStore?.relayTransaction(txRequest);
  }

  decodeMarketplaceCalldata(transaction: TransactionRequest): BuyNowParams {
    if (!transaction.data || !transaction.to)
      throw new Error('Invalid transaction');
    const selector = ethers.utils.hexlify(transaction.data).slice(0, 10);
    const contract = getContractByAddress(transaction.to);
    const abi = ABIs[contract];
    if (!abi)
      throw new Error(
        `${transaction.to} is not a supported destination address`
      );
    const instance = new ethers.Contract(transaction.to, abi);
    switch (contract) {
      case Contracts.LooksRare: {
        const args: any = instance.interface.decodeFunctionData(
          selector,
          transaction.data!
        );
        console.log('looksrare args: ', args);
        return {
          marketplace: transaction.to,
          collection: args.makerAsk.collection,
          tokenId: args.makerAsk.tokenId,
        };
      }
      default:
        throw new Error(
          `Unsupported transaction: ${JSON.stringify(transaction)}`
        );
    }
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
