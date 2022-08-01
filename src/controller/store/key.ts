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

  constructor(root: ControllerStore) {
    this.root = root;
    this.keyPair = undefined;
    this.stage = KeyStoreStage.Uninitialized;
    this.torusSdk = new Customauth({
      // TODO: use dynamic param
      baseUrl: `http://localhost:8080/`,
      network: 'testnet',
    });
    makeAutoObservable(this, { root: false });
  }

  // TODO: stubbed for now.
  getAccount(): Account {
    return {
      publicKey: ethers.utils.computePublicKey(
        '0x974fa6e246e2effa69150996571896bbfd54a502ff2b1e85f51fb132764d8055'
      ),
      privateKey:
        '0x974fa6e246e2effa69150996571896bbfd54a502ff2b1e85f51fb132764d8055',
      address: '0x7bB17c9401110D05ec39894334cC9d7721E90688',
    };
  }

  get state() {
    return {
      keyPair: this.keyPair,
      pendingLogin: this.pendingLogin,
      currentUser: this.currentUser,
      stage: this.stage,
    };
  }

  setKeyPair(pubKey: string, privKey: string): void {
    this.keyPair = { pubKey, privKey };
  }

  getKeyPair(): KeyPair | undefined {
    return this.keyPair;
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

    const torusResponse = await this.torusSdk.getTorusKey(
      'voyage-finance-firebase-testnet',
      currentUser.uid,
      {
        verifier_id: currentUser.uid,
      },
      currentUser.jwt
    );
    console.log('torusResponse', torusResponse);
    this.setKeyPair(torusResponse.publicAddress, torusResponse.privateKey);
    this.setUserInfo(currentUser);
    this.stage = KeyStoreStage.Initialized;
  }
}

export default KeyStore;
