import ControllerStore from './root';
import { Account, KeyStoreStage, AuthInfo, KeyStorePersist } from '../../types';
import { ethers } from 'ethers';
import { makeAutoObservable, toJS } from 'mobx';
import Customauth from '@toruslabs/customauth';
import { storage } from 'webextension-polyfill';
import _, { omit } from 'lodash';
import { GsnProvider } from 'controller/gsnProvider';
import { throws } from 'assert';

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
  gsnProvider?: GsnProvider;

  constructor(root: ControllerStore) {
    this.root = root;
    this.stage = KeyStoreStage.Uninitialized;
    this.isTermsSigned = false;
    this.torusSdk = new Customauth({
      baseUrl: process.env.VOYAGE_WEB_URL!,
      network: 'testnet',
    });
    makeAutoObservable(this, { root: false });
    this.initialize();
    this.gsnProvider = new GsnProvider();
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
    if (stateObject) {
      this.stage = stateObject.stage;
      this.isTermsSigned = stateObject.isTermsSigned;
      this.account = stateObject.account;
      this.reconstructKeyPair();
    }
  }

  async reconstructKeyPair() {
    if (!this.account) return;

    const torusKeys = await this.getToruskey(
      this.account.auth.uid,
      this.account.auth.jwt
    );

    this.account = {
      ...this.account,
      keyPair: {
        privateKey: torusKeys.privateKey,
        publicKey: torusKeys.pubKey?.pub_key_X,
      },
    };
  }

  persistState() {
    const stateObject: KeyStorePersist = {
      stage: this.stage,
      isTermsSigned: this.isTermsSigned,
      account: omit(toJS(this.account!), ['keyPair']),
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

  async getToruskey(uid: string, jwt: string) {
    if (!process.env.VOYAGE_DEBUG)
      return await this.torusSdk.getTorusKey(
        'voyage-finance-firebase-testnet',
        uid,
        {
          verifier_id: uid,
        },
        jwt
      );
    const mnemonic = process.env.DEBUG_GOERLI_MNEMONIC;
    const wallet = mnemonic
      ? new ethers.Wallet(
          '0xafd746101717d4ffbb8e387164e562e6299d290979ae66b76178c8088c314e0a'
        ) // ethers.Wallet.fromMnemonic(mnemonic) //
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
    await this.gsnProvider?.init();
    await this.gsnProvider?.addAccount(torusResponse.privateKey);

    await this.root.voyageStore.fetchVault();
    this.stage = KeyStoreStage.Initialized;
    this.persistState();
  }

  cancelLogin() {
    this.pendingLogin = undefined;
    this.stage = KeyStoreStage.Uninitialized;
    this.account = undefined;
    this.isTermsSigned = false;
    storage.local.remove('keyStore');
  }

  testGsn() {
    console.log('🚀 ~ file: key.ts ~ line 185 ~ KeyStore ~ testGsn ~ testGsn');
    this.gsnProvider?.buyNow(this.account!.address);
  }
}

export default KeyStore;
