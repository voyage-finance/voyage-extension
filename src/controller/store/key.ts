import ControllerStore from './root';
import { Account } from '../types';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';

interface KeyPair {
  pubKey: string;
  privKey: string;
}

class KeyStore {
  root: ControllerStore;
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  email: string;
  keyPair?: KeyPair;

  constructor(root: ControllerStore) {
    this.root = root;
    this.keyPair = undefined;
    this.isLoggingIn = false;
    this.isLoggedIn = false;
    this.email = '';
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
      isLoggingIn: this.isLoggingIn,
      isLoggedIn: this.isLoggedIn,
    };
  }

  setKeyPair(pubKey: string, privKey: string): void {
    this.keyPair = { pubKey, privKey };
  }

  getKeyPair(): KeyPair | undefined {
    return this.keyPair;
  }

  startLogin(email: string) {
    this.isLoggingIn = true;
    this.email = email;
  }

  finishLogin(idToken: string) {
    // TODO: destructure idToken into private and public key
    this.setKeyPair(idToken, idToken);
    this.isLoggingIn = false;
    this.isLoggedIn = true;
  }
}

export default KeyStore;
