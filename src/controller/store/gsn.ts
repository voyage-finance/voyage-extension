import * as ethers from 'ethers';
import { GSNConfig, RelayProvider } from '@opengsn/provider';
import { Contracts, getNetworkConfiguration } from '@utils/env';
import HttpProvider from 'web3-providers-http';
import { HttpClient, HttpWrapper } from '@opengsn/common';
import { RelayTransactionRequest } from '@opengsn/common/dist/types/RelayTransactionRequest';
import { RelayInfo } from '@opengsn/common/dist/types/RelayInfo';
import { RelayRegisteredEventInfo } from '@opengsn/common/dist/types/GSNContractsDataTypes';
import { createClientLogger } from '@opengsn/provider/dist/ClientWinstonLogger';
import { PingResponse } from '@opengsn/common/dist/PingResponse';
import { GsnTransactionDetails } from '@opengsn/common/dist/types/GsnTransactionDetails';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import sinon from 'sinon';
import ControllerStore from './root';
import { TransactionRequest } from '@ethersproject/providers';

export class GsnStore {
  ethersProvider: ethers.providers.Web3Provider;
  gsnProvider: RelayProvider;
  root: ControllerStore;

  constructor(root: ControllerStore) {
    this.root = root;
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
      preferredRelays: ['http://127.0.0.1:3000' || process.env.VOYAGE_API_URL],
    };

    const endpoint = getNetworkConfiguration().endpoint;
    // bug in http provider typings. just cast it and forget about this.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new HttpProvider(endpoint) as unknown as any;
    this.gsnProvider = RelayProvider.newProvider({
      provider,
      config,
      overrideDependencies: {
        logger,
        httpClient,
      },
    });
    this.init();
    this.ethersProvider = new ethers.providers.Web3Provider(this.gsnProvider);
  }

  async init() {
    await this.gsnProvider.init();
    console.log('------- gsnProvider.init()-----');
    const account = this.root.keyStore.getAccount();
    this.gsnProvider.addAccount(account!.keyPair!.privateKey);
  }

  async relayTransaction(transaction: TransactionRequest) {
    const account = await this.root.keyStore.getAccount();
    const signer = await this.ethersProvider.getSigner(account?.address);
    return signer.sendTransaction(transaction);
  }

  async createRelayHttpRequest(
    data: string,
    userAddress: string
  ): Promise<RelayTransactionRequest> {
    console.log('------ createRelayHttpRequest --------');
    const pingRequest = await fetch(`${process.env.VOYAGE_API_URL}/getAddr`);
    const pingResponseBody = await pingRequest.json();
    console.log('----- pingResponseBody ------', pingResponseBody);
    const pingResponse = {
      relayHubAddress: pingResponseBody.relayHubAddress,
      relayWorkerAddress: pingResponseBody.relayWorkerAddress,
    };
    const eventInfo: RelayRegisteredEventInfo = {
      baseRelayFee: pingResponseBody.baseRelayFee,
      pctRelayFee: pingResponseBody.pctRelayFee,
      relayManager: '',
      relayUrl: '',
    };
    const relayInfo: RelayInfo = {
      pingResponse: pingResponse as PingResponse,
      relayInfo: eventInfo,
    };
    const gsnTransactionDetails: GsnTransactionDetails = {
      from: userAddress,
      to: getNetworkConfiguration().contracts[Contracts.Voyage],
      data: data,
    };
    if (gsnTransactionDetails.gas == null) {
      const estimated =
        await this.gsnProvider.relayClient.dependencies.contractInteractor.estimateGas(
          gsnTransactionDetails
        );
      gsnTransactionDetails.gas = `0x${estimated.toString(16)}`;
    }
    gsnTransactionDetails.gasPrice =
      gsnTransactionDetails.forceGasPrice ??
      (await this.gsnProvider.relayClient._calculateGasPrice());

    const mergedDeployment =
      this.gsnProvider.relayClient.dependencies.contractInteractor.getDeployment();
    const sandbox = sinon.createSandbox();
    try {
      sandbox
        .stub(
          this.gsnProvider.relayClient.dependencies.contractInteractor,
          'getDeployment'
        )
        .returns(mergedDeployment);
      const mergedTransactionDetail = Object.assign(
        {},
        gsnTransactionDetails,
        {}
      );
      // do not 'return await' here as it will defer executing the 'finally' block and enable re-stubbing
      // (will crash on 'let x = [createRelayHttpRequest(), createRelayHttpRequest()]')
      // eslint-disable-next-line @typescript-eslint/return-await
      const req = this.gsnProvider.relayClient._prepareRelayHttpRequest(
        relayInfo,
        mergedTransactionDetail
      );
      return req;
    } finally {
      sandbox.restore();
    }
  }
}
