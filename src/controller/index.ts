import { Duplex } from 'stream';
import { ethers } from 'ethers';
import pump from 'pump';
import {
  createAsyncMiddleware,
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
import { Network } from './types';
import { createProviderMiddleware } from './rpc';

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
  engine: JsonRpcEngine;
  store: ControllerStore;
  private disposer: IReactionDisposer;

  constructor() {
    super();
    this.provider = new ethers.providers.AlchemyProvider(
      Network.Rinkeby,
      '2rkHcv3Pdg7j3iHPWUu9cDsEOtSoXtoB'
    );
    this.engine = this.createRpcEngine();
    this.store = new ControllerStore(this.provider);
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

  getState = () => {
    return this.store.state;
  };

  get api() {
    return {
      getState: this.getState,
      connectWithWC: this.connectWithWC,
      disconnectWC: this.disconnectWC,
      approveWalletConnectSession:
        this.store.walletConnectStore.approveConnectionRequest,
      rejectWalletConnectionSession:
        this.store.walletConnectStore.rejectConnectionRequest,
    };
  }

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
              this.store.walletConnectStore.addConnectionRequest({
                id,
                origin: req.peerMeta.url,
                type: 'wc',
                metadata: req.peerMeta,
                onApprove: async () => {
                  const { chainId } = await this.provider.getNetwork();
                  console.log('chain id: ', chainId);
                  const vault = await this.store.voyageStore.getVault();
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
    return new Promise<void>(async (resolve, reject) => {
      connection.on('disconnect', () => {
        console.log('handling manual disconnect');
        resolve();
      });
    });
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
    engine.push(this.createVoyageMiddleware());
    engine.push(createProviderMiddleware(this.provider));
    return engine;
  };

  private createVoyageMiddleware = () => {
    return createAsyncMiddleware(async (req, res, next) => {
      console.log('voyage processing rpc request: ', req);
      if (req.method === 'eth_accounts') {
        res.result = ['0x7bB17c9401110D05ec39894334cC9d7721E90688'];
        return;
      }

      await next();
      console.log('metamask handled the request: ', req);
    });
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
