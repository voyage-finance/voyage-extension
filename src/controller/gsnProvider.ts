import * as ethers from 'ethers';
import { GSNConfig, RelayProvider } from '@opengsn/provider';
import { getNetworkConfiguration, VoyageContracts } from '@utils/env';
import VoyageAbi from 'abis/voyage.json';
import HttpProvider from 'web3-providers-http';
import { HttpClient, HttpWrapper } from '@opengsn/common';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import { createClientLogger } from '@opengsn/provider/dist/ClientWinstonLogger';

export class GsnProvider {
  gsnProvider: RelayProvider;

  constructor() {
    console.log('HttpProvider', HttpProvider);
    const logger = createClientLogger({ logLevel: 'info' });
    const httpClient = new HttpClient(
      new HttpWrapper({ adapter: fetchAdapter }),
      logger
    );
    const config: Partial<GSNConfig> = {
      paymasterAddress:
        '0xA6e10aA9B038c9Cddea24D2ae77eC3cE38a0c016'.toLowerCase(),
      auditorsCount: 0,
      preferredRelays: ['http://127.0.0.1:3000'],
    };

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
      overrideDependencies: {
        logger,
        httpClient,
      },
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

  async getVault(userAddress: string) {
    const provider = new ethers.providers.Web3Provider(this.gsnProvider);
    const voyage = new ethers.Contract(
      getNetworkConfiguration().contracts[VoyageContracts.Voyage],
      VoyageAbi,
      provider.getSigner(userAddress)
    );
    const before = await voyage.getVaultAddr(userAddress);
    console.log(
      '🚀 ~ file: gsnProvider.ts ~ line 47 ~ GsnProvider ~ getVault ~ before',
      before
    );
  }

  async buyNow(
    userAddress: string,
    _collection: string,
    _tokenId: string,
    _vault: string,
    _marketplace: string,
    _data: ethers.BytesLike
  ) {
    const provider = new ethers.providers.Web3Provider(this.gsnProvider);
    const voyage = new ethers.Contract(
      getNetworkConfiguration().contracts[VoyageContracts.Voyage],
      VoyageAbi,
      provider.getSigner('0xAD5792b1D998f607d3EEB2f357138A440B03f19f')
    );
    console.log('---------- buyNow params ------------', {
      _collection,
      _tokenId,
      _vault,
      _marketplace,
      _data,
    });
    const tx = await voyage.buyNow(
      _collection,
      _tokenId,
      _vault,
      _marketplace,
      _data
    );
    console.log(
      '🚀 ~ file: gsnProvider.ts ~ line 47 ~ GsnProvider ~ buyNow ~ before',
      tx
    );
  }
}
