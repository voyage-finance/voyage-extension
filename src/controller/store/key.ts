import ControllerStore from './root';
import { Account } from '../types';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
import ThresholdKey from '@tkey/core';
import TorusServiceProvider from '@tkey/service-provider-torus';

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
  isLoggedIn: boolean;
  keyPair?: KeyPair;
  tKey: ThresholdKey;

  constructor(root: ControllerStore) {
    this.root = root;
    this.keyPair = undefined;
    this.isLoggedIn = false;
    makeAutoObservable(this, { root: false });

    const serviceProvider = new TorusServiceProvider({
      customAuthArgs: { baseUrl: `http://localhost:8080/` },
    });
    this.tKey = new ThresholdKey({ serviceProvider });
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
      isLoggedIn: this.isLoggedIn,
    };
  }

  setKeyPair(pubKey: string, privKey: string): void {
    this.keyPair = { pubKey, privKey };
  }

  getKeyPair(): KeyPair | undefined {
    return this.keyPair;
  }

  startLogin(email: string, fingerprint: string) {
    // TODO generate fingerprint here
    this.pendingLogin = {
      email,
      fingerprint,
    };
  }

  async finishLogin(idToken: string) {
    // TODO: destructure idToken into private and public key
    this.setKeyPair(idToken, idToken);
    this.pendingLogin = undefined;
    this.isLoggedIn = true;

    await this.tKey.initialize();
    const torusResponse = await (
      this.tKey.serviceProvider as TorusServiceProvider
    ).triggerLogin({
      typeOfLogin: 'jwt',
      verifier: 'voyage-finance-firebase-testnet',
      clientId:
        'BDK2U8pm2MUgfDlx2dufjuUl2YuyNMPfrPG1ehwvqC9KAqt1dmZajsiIVCRW1nQiu9zHr7MKXNQ0V9sTMpkUnzM',
      queryParameters: {
        id_token: idToken,
      },
    });
    console.log('torusResponse', torusResponse);
  }
}

export default KeyStore;
