import ControllerStore from './root';
import { Account, KeyStoreStage, UserInfo } from '../types';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
import Customauth from '@toruslabs/customauth';
import { storage } from 'webextension-polyfill';

interface KeyPair {
  pubKey: string;
  privKey: string;
}

export interface PendingLogin {
  email: string;
  fingerprint: string;
}

class KeyStore {
  root: ControllerStore;
  pendingLogin?: PendingLogin;
  keyPair?: KeyPair;
  stage: KeyStoreStage;
  torusSdk: Customauth;
  currentUser?: UserInfo;
  isTermsSigned: boolean;
  account?: Account;

  constructor(root: ControllerStore) {
    this.root = root;
    this.keyPair = undefined;
    this.stage = KeyStoreStage.Uninitialized;
    this.isTermsSigned = false;
    this.torusSdk = new Customauth({
      // TODO: use dynamic param
      baseUrl: `http://localhost:8080/`,
      network: 'testnet',
    });
    makeAutoObservable(this, { root: false });
  }

  getAccount(): Account | undefined {
    return this.account;
  }

  get state() {
    return {
      keyPair: this.keyPair,
      pendingLogin: this.pendingLogin,
      currentUser: this.currentUser,
      stage: this.stage,
      isTermsSigned: this.isTermsSigned,
    };
  }

  setKeyPair(pubKey: string, privKey: string): void {
    this.keyPair = { pubKey, privKey };
  }

  getKeyPair(): KeyPair | undefined {
    return this.keyPair;
  }

  setTermsSigned(): void {
    this.isTermsSigned = true;
  }

  setUserInfo(user: UserInfo): void {
    this.currentUser = user;
    storage.local.set({ access_token: user.accessToken, id_token: user.jwt });
  }

  startLogin(email: string, fingerprint: string) {
    // TODO generate fingerprint here
    this.pendingLogin = {
      email,
      fingerprint,
    };
    this.stage = KeyStoreStage.WaitingConfirm;
  }

  async finishLogin(currentUser: UserInfo) {
    this.stage = KeyStoreStage.Initializing;
    this.pendingLogin = undefined;

    const torusResponse = !process.env.VOYAGE_DEBUG
      ? await this.torusSdk.getTorusKey(
          'voyage-finance-firebase-testnet',
          currentUser.uid,
          {
            verifier_id: currentUser.uid,
          },
          currentUser.jwt
        )
      : {
          publicAddress: ethers.Wallet.createRandom().address,
          privateKey: ethers.Wallet.createRandom().privateKey,
          pubKey: undefined,
        };

    // TODO: get pubKey as a string
    this.setKeyPair(torusResponse.publicAddress, torusResponse.privateKey);
    this.account = {
      privateKey: torusResponse.privateKey,
      publicKey: torusResponse.pubKey?.pub_key_X,
      address: torusResponse.publicAddress,
      email: currentUser.email,
    };
    await this.root.voyageStore.fetchVault();
    this.setUserInfo(currentUser);
    this.stage = KeyStoreStage.Initialized;
  }

  cancelLogin() {
    this.pendingLogin = undefined;
    this.stage = KeyStoreStage.Uninitialized;
  }
}

export default KeyStore;
