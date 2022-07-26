import ControllerStore from './root';
import { Account } from '../types';
import { ethers } from 'ethers';

class KeyStore {
  root: ControllerStore;
  constructor(root: ControllerStore) {
    this.root = root;
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
}

export default KeyStore;
