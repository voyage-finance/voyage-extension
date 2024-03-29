import Customauth from '@toruslabs/customauth';
import { config } from '@utils/env';
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
      baseUrl: config.voyageWebUrl,
      network: config.torusNetwork as 'testnet',
      networkUrl:
        config.torusNetwork === 'testnet'
          ? 'https://nd-897-493-541.p2pify.com/8e00c5f7fb1c3aaf861c6fde167b83a2' // override default sdk ropsten node
          : undefined,
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

  get api() {
    return {
      startLogin: this.startLogin.bind(this),
      finishLogin: this.finishLogin.bind(this),
      cancelLogin: this.cancelLogin.bind(this),
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
      return signature;
    }
    return Promise.reject("Can't reconstruct signer, private key not found");
  }

  startLogin(email: string, fingerprint: string) {
    this.pendingLogin = {
      email,
      fingerprint,
    };
    if (config.debug) {
      this.startInitializing({
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

  async getToruskey(sub: string, jwt: string) {
    if (!config.debug) {
      return this.torusSdk.getTorusKey(
        config.torusVerifier,
        sub,
        {
          verifier_id: sub,
        },
        jwt
      );
    }
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

  async startInitializing(currentUser: AuthInfo) {
    this.stage = KeyStoreStage.Initializing;
    this.pendingLogin = undefined;

    this.account = {
      email: currentUser.email,
      auth: currentUser,
    };
  }

  async finishLogin() {
    if (this.stage != KeyStoreStage.Initializing)
      throw new Error('Not in pending login process');
    const torusResponse = await this.getToruskey(
      this.account!.auth.uid!,
      this.account!.auth.jwt!
    );

    this.account = {
      ...this.account!,
      keyPair: {
        privateKey: torusResponse.privateKey,
        publicKey: torusResponse.pubKey?.pub_key_X,
      },
      address: torusResponse.publicAddress,
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
    storage.local.remove('storedWrapEthTx');
    browser.action.setPopup({ popup: '' });
  }
}

export default KeyStore;
