import * as ethers from 'ethers';
import { GSNConfig, RelayProvider } from '@opengsn/provider';
import { getNetworkConfiguration, VoyageContracts } from '@utils/env';
import VoyageAbi from 'abis/voyage.json';
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
import { LOOKS_EXCHANGE_RINKEBY } from '@utils/constants';

export class GsnStore {
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
  }

  async init() {
    await this.gsnProvider.init();
    console.log('------- gsnProvider.init()-----');
  }

  addAccount = async (privateKey: string) => {
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

  async buyNow(txId: string) {
    const provider = new ethers.providers.Web3Provider(this.gsnProvider);
    const voyage = new ethers.Contract(
      getNetworkConfiguration().contracts[VoyageContracts.Voyage],
      VoyageAbi,
      provider.getSigner(this.root.keyStore.account?.address)
    );
    const transaction = this.root.transactionStore.transactions[txId];
    const tx = await voyage.buyNow(
      transaction.orderPreview?.metadata.collectionAddress,
      transaction.orderPreview?.metadata.tokenId,
      this.root.voyageStore.vaultAddress,
      LOOKS_EXCHANGE_RINKEBY,
      transaction.options.data
    );
    console.log('--------------- buyNow - tx ----------------', tx);
    this.root.transactionStore.confirmTransaction(txId, tx.hash);
    return tx;
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
      to: getNetworkConfiguration().contracts[VoyageContracts.Voyage],
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
