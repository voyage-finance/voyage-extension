import { TransactionRequest } from '@ethersproject/providers';
import { HttpClient, HttpWrapper } from '@opengsn/common';
import { PingResponse } from '@opengsn/common/dist/PingResponse';
import { RelayRegisteredEventInfo } from '@opengsn/common/dist/types/GSNContractsDataTypes';
import { GsnTransactionDetails } from '@opengsn/common/dist/types/GsnTransactionDetails';
import { RelayInfo } from '@opengsn/common/dist/types/RelayInfo';
import { RelayTransactionRequest } from '@opengsn/common/dist/types/RelayTransactionRequest';
import { GSNConfig, RelayProvider } from '@opengsn/provider';
import { createClientLogger } from '@opengsn/provider/dist/ClientWinstonLogger';
import { config as conf } from '@utils/env';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import * as ethers from 'ethers';
import sinon from 'sinon';
import HttpProvider from 'web3-providers-http';
import ControllerStore from './root';

export class GsnStore {
  root: ControllerStore;
  gsnProvider: RelayProvider;
  ethersProvider!: ethers.providers.Web3Provider;
  initialized: Promise<void>;

  constructor(root: ControllerStore) {
    this.root = root;
    console.log('HttpProvider', HttpProvider);
    const logger = createClientLogger({ logLevel: 'info' });
    const httpClient = new HttpClient(
      new HttpWrapper({ adapter: fetchAdapter }),
      logger
    );
    const config: Partial<GSNConfig> = {
      paymasterAddress: conf.paymaster, // do not remove toLowerCase, as this breaks `RelayClient`
      auditorsCount: 0,
      preferredRelays: [conf.voyageApiUrl],
    };

    console.log('---- [GsnStore] endpoint----', process.env.ALCHEMY_RPC_URL);
    // bug in http provider typings. just cast it and forget about this.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new HttpProvider(conf.alchemyRpcUrl) as unknown as any;
    this.gsnProvider = RelayProvider.newProvider({
      provider,
      config,
      overrideDependencies: {
        logger,
        httpClient,
      },
    });
    this.initialized = this.init();
  }

  init = async () => {
    await this.gsnProvider.init();
    console.log('------- gsnProvider.init()-----');
    this.ethersProvider = new ethers.providers.Web3Provider(this.gsnProvider);
  };

  async addAccount(privKey: string) {
    await this.gsnProvider.relayClient.initializingPromise;
    this.gsnProvider.addAccount(privKey);
    console.log('[gsn] added account');
  }

  relayTransaction = (transaction: TransactionRequest) => {
    const account = this.root.keyStore.getAccount();
    const signer = this.ethersProvider.getSigner(account?.address);
    return signer.sendTransaction(transaction);
  };

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
      to: conf.voyage,
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
