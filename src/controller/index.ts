import { Duplex } from 'stream';
import { ethers } from 'ethers';
import pump from 'pump';
import {
  createIdRemapMiddleware,
  JsonRpcEngine,
  JsonRpcRequest,
} from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import createMetaRPCHandler from '../rpc/virtual/server';
import WalletConnect from '@walletconnect/client';
import { ControllerStore } from './store';
import { IReactionDisposer, reaction, toJS } from 'mobx';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { nanoid } from 'nanoid';
import { openNotificationWindow } from '@utils/extension';
import { createWcStream } from './wcStream';
import { createProviderMiddleware, createVoyageMiddleware } from './rpc';
import VoyageRpcService from './rpc/service';
import { auth, encodeRedirectUri } from '@utils/auth';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { createRandomFingerprint } from '@utils/random';
import { registerMessageListeners } from './runtimeMessage';
import { getJsonProvider } from '@utils/env';
import { ApprovalType } from 'types';
import { IClientMeta } from '@walletconnect/types';

interface WalletConnectSessionRequest {
  chainId: number | null;
  peerId: string;
  peerMeta: PeerMeta;
}

export interface PeerMeta {
  description?: string;
  icons?: string[];
  name: string;
  url: string;
}

export class VoyageController extends SafeEventEmitter {
  provider: ethers.providers.JsonRpcProvider;
  service: VoyageRpcService;
  engine: JsonRpcEngine;
  store: ControllerStore;
  private disposer: IReactionDisposer;

  constructor() {
    super();

    this.provider = getJsonProvider();
    this.store = new ControllerStore(this.provider, this);
    this.service = new VoyageRpcService(this.store);
    this.engine = this.createRpcEngine();
    this.disposer = reaction(
      () => this.store.state,
      (state) => {
        console.log('[controller] updated state: ', state);
        this.sendUpdate(state);
      }
    );
  }

  setupControllerConnection = (stream: Duplex) => {
    stream.on('data', createMetaRPCHandler(this.api, stream));
    const handleUpdate = (update: unknown) => {
      stream.write({
        jsonrpc: '2.0',
        method: 'sendUpdate',
        params: [update],
      });
    };
    this.on('update', handleUpdate);
    stream.on('end', () => this.removeListener('update', handleUpdate));
  };

  /**
   * Sets up a connection to the Voyage service via the middleware.
   * This provider intercepts and forwards certain RPC methods, such as eth_requestAccounts, to the Voyage instance.
   * Other methods are directly forwarded to Metamask, or after approval is given.
   * Used by external clients, a.k.a., games, dApps, guild management software via WC or window.voyage.
   * @param stream - duplex stream to pipe to the underlying provider
   */
  setupVoyageProviderConnection = (stream: Duplex) => {
    const engineStream = createEngineStream({ engine: this.engine });
    pump(stream, engineStream, stream);
  };

  init() {
    registerMessageListeners(this);
  }

  getState = () => {
    return this.store.state;
  };

  get api() {
    return {
      getState: this.getState,
      connectWithWC: this.connectWithWC,
      disconnectWC: this.disconnectWC,
      sendMagicLinkToEmail: this.sendMagicLinkToEmail,
      cancelLogin: this.cancelLogin,
      setTermsAgreed: this.setTermsAgreed,
      registerVaultWatcher: this.registerVaultWatcher,
      openNotificationWindow: this.openNotificationWindow,
      createRelayHttpRequest: this.createRelayHttpRequest,
      ...this.store.walletConnectStore.api,
      ...this.store.transactionStore.api,
      ...this.store.orderStore.api,
      ...this.store.voyageStore.api,
    };
  }

  createRelayHttpRequest = (data: string, user: string) => {
    return this.store.gsnStore?.createRelayHttpRequest(data, user);
  };

  connectWithWC = async (uri: string) => {
    const connector = new WalletConnect({
      uri,
      clientMeta: {
        description: 'Voyage Finance extension',
        url: 'https://voyage.finance',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'Voyage Finance',
      },
    });
    await connector.createSession();

    return new Promise<{ id: string; peerMeta: PeerMeta; peerId: string }>(
      (resolve, reject) => {
        connector.on(
          'session_request',
          async (
            error,
            payload: JsonRpcRequest<[WalletConnectSessionRequest]>
          ) => {
            if (error) {
              console.log('error from wc?: ', error);
              return reject(error);
            }
            console.log('payload from wc?: ', payload);
            try {
              const [req] = payload.params!;
              const id = nanoid();
              this.store.walletConnectStore.addApprovalRequest({
                id,
                type: ApprovalType.WALLET_CONNECT,
                client: req.peerMeta as IClientMeta,
                onApprove: async () => {
                  const { chainId } = await this.provider.getNetwork();
                  console.log('chain id: ', chainId);
                  const vault = await this.store.voyageStore.fetchVault();
                  console.log('vault: ', vault);
                  if (!vault) {
                    connector.rejectSession(
                      new Error('User does not have any vaults')
                    );
                    return;
                  }
                  connector.approveSession({
                    chainId: chainId,
                    accounts: [vault!],
                  });
                  const wcStream = createWcStream(connector);
                  this.setupVoyageProviderConnection(wcStream as Duplex);
                  await this.store.walletConnectStore.addConnection(
                    req.peerId,
                    connector
                  );
                },
                onReject: async () => {
                  connector.rejectSession(
                    new Error('User rejected session request')
                  );
                },
              });

              resolve({ id, peerMeta: req.peerMeta, peerId: req.peerId });
            } catch (err) {
              console.log('error in wc connect bg: ', JSON.stringify(err));
            }
          }
        );
      }
    );
  };

  disconnectWC = async (id: string) => {
    const connection = await this.store.walletConnectStore.getConnection(id);
    connection.killSession();
    // TODO: add a timeout
    return new Promise<void>((resolve) => {
      connection.on('disconnect', () => {
        console.log('handling manual disconnect');
        resolve();
      });
    });
  };

  sendMagicLinkToEmail = async (email: string) => {
    const generatedFingerPrint = createRandomFingerprint();
    const encodedRedirectUri = encodeRedirectUri(email, generatedFingerPrint);

    if (!process.env.VOYAGE_DEBUG)
      await sendSignInLinkToEmail(auth, email, {
        url: `${process.env.VOYAGE_WEB_URL}/onboard?encoded=${encodedRedirectUri}`,
        handleCodeInApp: true,
      });
    this.store.keyStore.startLogin(email, generatedFingerPrint);
  };

  cancelLogin = () => {
    this.store.keyStore.cancelLogin();
  };

  setTermsAgreed = () => {
    this.store.keyStore.setTermsSigned();
  };

  registerVaultWatcher = async (
    maxFeePerGas: string,
    maxPriorityFeePerGas: string
  ): Promise<string> => {
    const userAddress = this.store.keyStore.getAccount()?.address;
    const token = this.store.keyStore.account?.auth.jwt;

    if (!userAddress || !token || userAddress === ethers.constants.AddressZero)
      return Promise.reject('token or userAddress is not set');

    const data = {
      userAddress,
      maxFeePerGas,
      maxPriorityFeePerGas,
    };

    const response = await fetch(`${process.env.VOYAGE_API_URL}/v1/vault/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    return body.sentinelObj?.vault;
  };

  private sendUpdate = (state: unknown) => {
    this.emit('update', toJS(state));
  };

  /**
   * Creates a JSON-RPC engine interface to the user's Vault
   */
  private createRpcEngine = () => {
    const engine = new JsonRpcEngine();
    engine.push(createIdRemapMiddleware());
    engine.push(createVoyageMiddleware(this.service));
    engine.push(createProviderMiddleware(this.provider));
    return engine;
  };

  private openNotificationWindow = () =>
    openNotificationWindow({
      url: 'notification.html',
      type: 'popup',
      width: 300,
      height: 600,
      left: 0,
      top: 0,
    });
}
