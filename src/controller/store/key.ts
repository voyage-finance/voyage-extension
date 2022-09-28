import Customauth from '@toruslabs/customauth';
import { ethers } from 'ethers';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import browser, { storage } from 'webextension-polyfill';
import { Account, AuthInfo, KeyStorePersist, KeyStoreStage } from '../../types';
import ControllerStore from './root';

export interface PendingLogin {
  email: string;
  fingerprint: string;
}

class KeyStore {
  root: ControllerStore;
  pendingLogin?: PendingLogin;
  stage: KeyStoreStage;
  torusSdk: Customauth;
  isTermsSigned: boolean;
  account?: Account;

  constructor(root: ControllerStore) {
    this.root = root;
    this.stage = KeyStoreStage.Uninitialized;
    this.isTermsSigned = false;
    this.torusSdk = new Customauth({
      baseUrl: process.env.VOYAGE_WEB_URL!,
      network: process.env.TORUS_NETWORK! as 'testnet',
    });
    makeAutoObservable(this, { root: false });
    this.initialize();
  }

  getAccount(): Account | undefined {
    return this.account;
  }

  get state() {
    return {
      pendingLogin: this.pendingLogin,
      authInfo: this.account?.auth,
      stage: this.stage,
      isTermsSigned: this.isTermsSigned,
      account: this.account,
    };
  }

  async initialize() {
    const stateObject = (await storage.local.get('keyStore')).keyStore as
      | KeyStorePersist
      | undefined;
    runInAction(() => {
      if (stateObject) {
        this.stage = stateObject.stage;
        this.isTermsSigned = stateObject.isTermsSigned;
        this.account = stateObject.account;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        this.root.gsnStore.addAccount(this.account?.keyPair?.privateKey!);
      }
    });
  }

  persistState() {
    const stateObject: KeyStorePersist = {
      stage: this.stage,
      isTermsSigned: this.isTermsSigned,
      account: toJS(this.account!),
    };
    storage.local.set({
      keyStore: stateObject,
    });
  }

  setTermsSigned(): void {
    this.isTermsSigned = true;
    this.persistState();
  }

  async signMessage(message: string) {
    const wallet = this.getWallet();
    if (wallet) {
      const signature = await wallet.signMessage(message);
      console.log('signature : ', signature);
      return signature;
    }
    return Promise.reject("Can't reconstruct signer, private key not found");
  }

  startLogin(email: string, fingerprint: string) {
    this.pendingLogin = {
      email,
      fingerprint,
    };
    if (process.env.VOYAGE_DEBUG) {
      this.finishLogin({
        jwt: 'jwt',
        accessToken: 'accessToken',
        uid: 'uid',
        email,
      });
    } else this.stage = KeyStoreStage.WaitingConfirm;
  }

  getSigner() {
    return new ethers.Wallet(
      this.account!.keyPair!.privateKey,
      this.root.provider
    );
  }

  async getToruskey(uid: string, jwt: string) {
    if (!process.env.VOYAGE_DEBUG)
      return await this.torusSdk.getTorusKey(
        process.env.TORUS_VERIFIER!,
        uid,
        {
          verifier_id: uid,
        },
        jwt
      );
    const mnemonic = process.env.DEBUG_GOERLI_MNEMONIC;
    const wallet = process.env.DEBUG_LOCALHOST_PRIVATE_KEY
      ? new ethers.Wallet(process.env.DEBUG_LOCALHOST_PRIVATE_KEY)
      : mnemonic
      ? ethers.Wallet.fromMnemonic(mnemonic)
      : ethers.Wallet.createRandom();
    return {
      publicAddress: wallet.address,
      privateKey: wallet.privateKey,
      pubKey: { pub_key_X: wallet.publicKey },
    };
  }

  getWallet() {
    if (this.account?.keyPair?.privateKey)
      return new ethers.Wallet(this.account?.keyPair?.privateKey);
  }

  async finishLogin(currentUser: AuthInfo) {
    this.stage = KeyStoreStage.Initializing;
    this.pendingLogin = undefined;

    const torusResponse = await this.getToruskey(
      currentUser.uid,
      currentUser.jwt
    );

    this.account = {
      keyPair: {
        privateKey: torusResponse.privateKey,
        publicKey: torusResponse.pubKey?.pub_key_X,
      },
      address: torusResponse.publicAddress,
      email: currentUser.email,
      auth: currentUser,
    };

    await this.root.voyageStore.fetchVault();
    await this.root.gsnStore.initialized;
    this.root.gsnStore.addAccount(torusResponse.privateKey);
    this.stage = KeyStoreStage.Initialized;
    this.persistState();
  }

  cancelLogin() {
    this.pendingLogin = undefined;
    this.stage = KeyStoreStage.Uninitialized;
    this.account = undefined;
    this.isTermsSigned = false;
    storage.local.remove('keyStore');
    storage.local.remove('vaultAddress');
    browser.action.setPopup({ popup: '' });
  }
}

export default KeyStore;
