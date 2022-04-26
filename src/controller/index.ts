import { Duplex } from 'stream';
import browser from 'webextension-polyfill';
import PortStream from 'extension-port-stream';
import { getMetaMaskExtensionId, setupMultiplex } from '../utils';
import pump from 'pump';
import {
  createAsyncMiddleware,
  JsonRpcEngine,
  JsonRpcRequest,
} from 'json-rpc-engine';
import {
  createEngineStream,
  createStreamMiddleware,
} from 'json-rpc-middleware-stream';
import createMetaRPCHandler from '../rpc/virtual/server';
import WalletConnect from '@walletconnect/client';
import ControllerState from './state';
import { IReactionDisposer, reaction, toJS } from 'mobx';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { nanoid } from 'nanoid';
import { openNotificationWindow } from '../utils/extension';

interface WalletConnectSessionRequest {
  chainId: number | null;
  peerId: string;
  peerMeta: PeerMeta;
}

interface PeerMeta {
  description?: string;
  icons?: string[];
  name: string;
  url: string;
}

export class VoyageController extends SafeEventEmitter {
  engine: JsonRpcEngine;
  store: ControllerState;
  private disposer: IReactionDisposer;

  constructor() {
    super();
    this.engine = this.createRpcEngine();
    const state = new ControllerState();
    this.store = state;
    this.disposer = reaction(
      () => {
        console.log('approvals: ', state.state);
        return state.state;
      },
      (state) => {
        console.log('[controller] updated state: ', state);
        this.sendUpdate(state);
      }
    );
  }

  /**
   * Sets up a direct pass through stream to the MetaMask provider backend.
   * This provider is exclusively used internally by the Voyage extension (UI and background).
   * @param stream
   */
  setupMetaMaskProviderConnection = (stream: Duplex) => {
    const engineStream = createEngineStream({ engine: this.engine });
    pump(stream, engineStream, stream);
  };

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
   * Sets up a connection to the Voyage provider.
   * This provider intercepts certain RPC methods, such as eth_requestAccounts.
   * Used by external clients, a.k.a., games, dApps, guild management software via WC or window.voyage.
   * @param stream
   */
  setupVoyageProviderConnection = (stream: Duplex) => {
    // connect the voyage provider stream to the rpc engine
    const engine = new JsonRpcEngine();
    // intercept and handle some methods
    engine.push(this.createVoyageMiddleware());
    engine.push(this.engine.asMiddleware());
    const engineStream = createEngineStream({ engine });
    pump(stream, engineStream, stream);
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

    console.log('wc client: ', connector);

    return new Promise<{ peerMeta: PeerMeta; peerId: string }>(
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
            // connector.approveSession({ chainId: 1337, accounts: ['0x12345'] });
            try {
              const [req] = payload.params!;
              const approval = this.store.add({
                id: nanoid(),
                origin: req.peerMeta.url,
                type: 'wc',
                metadata: req.peerMeta,
              });
              await this.openNotificationWindow();
              await approval;

              connector.approveSession({
                chainId: 1337,
                accounts: ['0x12345'],
              });
              resolve({ peerMeta: req.peerMeta, peerId: req.peerId });
            } catch (err) {
              console.log('error in wc connect bg: ', JSON.stringify(err));
            }
          }
        );
      }
    );
  };

  getState = () => {
    return this.store.state;
  };

  get api() {
    return {
      getState: this.getState,
      connectWithWC: this.connectWithWC,
      approveApprovalRequest: this.approveApprovalRequest,
      rejectApprovalRequest: this.rejectApprovalRequest,
    };
  }

  approveApprovalRequest = (id: string) => {
    console.log('approving id: ', id);
    this.store.approve(id);
  };

  rejectApprovalRequest = (id: string) => {
    this.store.reject(id);
  };

  private sendUpdate = (state: unknown) => {
    this.emit('update', toJS(state));
  };

  /**
   * Create a raw duplex stream to the MetaMask extension provider
   */
  private createMetaMaskConnection = () => {
    const currentMetaMaskId = getMetaMaskExtensionId();
    const metaMaskPort = browser.runtime.connect(currentMetaMaskId);
    const metaMaskStream = new PortStream(metaMaskPort) as unknown as Duplex;
    // the multiplexer is a necessity, as the metamask provider only listens on the 'metamask-provider' substream
    const mux = setupMultiplex(metaMaskStream);
    // metamask background script pushes legacy data on this stream. ignore it.
    mux.ignoreStream('publicConfig');
    return mux.createStream('metamask-provider');
  };

  private createRpcEngine = () => {
    const metaMaskStream = this.createMetaMaskConnection();
    const metaMaskMiddleware = createStreamMiddleware();
    pump(
      metaMaskMiddleware.stream,
      metaMaskStream,
      metaMaskMiddleware.stream,
      () => console.log('disconnected from metamask provider')
    );
    const engine = new JsonRpcEngine();
    engine.push(metaMaskMiddleware.middleware);
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

  private createVoyageMiddleware = () => {
    return createAsyncMiddleware(async (req, res, next) => {
      console.log('processing request from inpage provider: ', req);
      if (req.method === 'eth_requestAccounts') {
        res.result = ['0x12345'];
        return;
      }

      await next();
      console.log('metamask handled the request: ', req);
    });
  };
}
