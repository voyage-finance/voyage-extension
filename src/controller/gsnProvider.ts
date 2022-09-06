import * as ethers from 'ethers';
import { RelayProvider } from '@opengsn/provider';
import { getNetworkConfiguration, VoyageContracts } from '@utils/env';
import VoyageAbi from 'abis/voyage.json';
import HttpProvider from 'web3-providers-http';

const config = {
  paymasterAddress: '0xA6e10aA9B038c9Cddea24D2ae77eC3cE38a0c016',
  auditorsCount: 0,
  preferredRelays: ['http://127.0.0.1:3000'],
};

export class GsnProvider {
  gsnProvider: RelayProvider;

  constructor() {
    console.log('HttpProvider', HttpProvider);
    // bug in http provider typings. just cast it and forget about this.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new HttpProvider(
      'http://127.0.0.1:8545'
    ) as unknown as any;
    console.log('provider', provider);
    this.gsnProvider = RelayProvider.newProvider({
      provider,
      config,
    });
  }

  async init() {
    console.log('------- gsnProvider.init()-----');
    await this.gsnProvider.init();
  }

  addAccount = async (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    console.log('------- wallet.privateKey -----', privateKey);
    console.log('------- wallet.address -----', wallet.address);
    this.gsnProvider.addAccount(privateKey);
  };

  async buyNow(userAddress: string) {
    const provider = new ethers.providers.Web3Provider(this.gsnProvider);
    const voyage = new ethers.Contract(
      getNetworkConfiguration().contracts[VoyageContracts.Voyage],
      VoyageAbi,
      provider.getSigner(userAddress)
    );
    const before = await voyage.getVaultAddr(userAddress);
    console.log(
      '🚀 ~ file: gsnProvider.ts ~ line 47 ~ GsnProvider ~ buyNow ~ before',
      before
    );
  }
}
