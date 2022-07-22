import { Duplex } from 'stream';
import browser from 'webextension-polyfill';
import PortStream from 'extension-port-stream';
import { getMetaMaskExtensionId, setupMultiplex } from '../utils';
import pump from 'pump';
import {
  createAsyncMiddleware,
  createIdRemapMiddleware,
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
import { openNotificationWindow } from '@utils/extension';
import ExtensionSessionStorage from './storage';
import { BaseProvider } from '@voyage-finance/providers';
import { createWcStream } from './wcStream';
import VoyageService from './voyage';
import { WebAuth } from 'auth0-js';

const CLIENT_SECRET = '';

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
  engine: JsonRpcEngine;
  provider: BaseProvider;
  store: ControllerState;
  voyage: VoyageService;
  auth0: WebAuth;
  private disposer: IReactionDisposer;

  constructor() {
    super();
    console.log('background script started');
    this.engine = this.createRpcEngine();
    this.provider = new BaseProvider(
      createEngineStream({ engine: this.engine }) as Duplex
    );
    this.voyage = new VoyageService(this.provider);
    this.store = new ControllerState(
      new ExtensionSessionStorage(),
      this.provider
    );
    this.auth0 = new WebAuth({
      domain: 'dev-tqbcqe09.us.auth0.com',
      clientID: 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o',
      responseType: 'token',
      redirectUri: 'https://pkgdckljbklfglahipfjjpccebmiboak.chromiumapp.org/',
    });
    this.disposer = reaction(
      () => this.store.state,
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
   * Sets up a connection to the Voyage service via the middleware.
   * This provider intercepts and forwards certain RPC methods, such as eth_requestAccounts, to the Voyage instance.
   * Other methods are directly forwarded to Metamask, or after approval is given.
   * Used by external clients, a.k.a., games, dApps, guild management software via WC or window.voyage.
   * @param stream - duplex stream to pipe to the underlying provider
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

  setupDomEventConnection = (stream: Duplex) => {
    this.onTabUpdate(stream);
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
              this.store.add({
                id,
                origin: req.peerMeta.url,
                type: 'wc',
                metadata: req.peerMeta,
                onApprove: async () => {
                  const chain = this.provider.chainId;
                  console.log('chain id: ', chain);
                  const vault = await this.voyage.getVault();
                  console.log('vault: ', vault);
                  if (!vault) {
                    connector.rejectSession(
                      new Error('User does not have any vaults')
                    );
                    return;
                  }
                  connector.approveSession({
                    chainId: parseInt(chain!, 16),
                    accounts: [vault!],
                  });
                  const wcStream = createWcStream(connector);
                  this.setupVoyageProviderConnection(wcStream as Duplex);
                  await this.store.addConnection(req.peerId, connector);
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
    const connection = await this.store.getConnection(id);
    connection.killSession();
    // TODO: add a timeout
    return new Promise<void>(async (resolve, reject) => {
      connection.on('disconnect', () => {
        console.log('handling manual disconnect');
        resolve();
      });
    });
  };

  getState = () => {
    return this.store.state;
  };

  startLogin = async (email: string) => {
    console.log('logging in');
    const res = await fetch(
      'https://dev-tqbcqe09.us.auth0.com/passwordless/start',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o',
          client_secret: CLIENT_SECRET,
          connection: 'email',
          email,
          send: 'code',
        }),
      }
    );
    console.log('res: ', res);
  };

  completeLogin = async (otp: string) => {
    const res = await fetch('https://dev-tqbcqe09.us.auth0.com/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: 'DzmlVbHqcvCOX9igHxaBI0cNqsF4pa0o',
        client_secret: CLIENT_SECRET,
        username: 'ian.tan@voyage.finance',
        otp,
        realm: 'email',
        scope: 'openid profile email',
      }),
    });
    const body = await res.json();
    console.log('res: ', body);
    return body;
  };

  get api() {
    return {
      getState: this.getState,
      connectWithWC: this.connectWithWC,
      disconnectWC: this.disconnectWC,
      startLogin: this.startLogin,
      completeLogin: this.completeLogin,
      approveApprovalRequest: this.approveApprovalRequest,
      rejectApprovalRequest: this.rejectApprovalRequest,
    };
  }

  approveApprovalRequest = async (id: string) => {
    console.log('approving id: ', id);
    await this.store.approve(id);
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

  private onTabUpdate = (stream: Duplex) => {
    const handleTabUpdated = (tabId: any, changeInfo: any, tab: any) => {
      if (changeInfo.status === 'complete') {
        if (tab.active) {
          console.log('setup dom connection');
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['injector.bundle.js'],
          });
          chrome.scripting.insertCSS({
            target: { tabId },
            files: ['inject.css'],
          });
        }
        console.log(
          `tab has been updated: ${tabId}, ${JSON.stringify(
            changeInfo,
            null,
            4
          )}`
        );
        stream.write({ msg: 'changed stuff', tabId, tab });
      }
    };
    browser.tabs.onUpdated.addListener(handleTabUpdated);
    stream.on('end', () => {
      console.log('dom stream ended');
      browser.tabs.onUpdated.removeListener(handleTabUpdated);
    });
  };

  /**
   * Creates a JSON-RPC engine interface to the raw MetaMask provider connection
   */
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
    engine.push(createIdRemapMiddleware());
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
      console.log('voyage processing rpc request: ', req);
      if (req.method === 'eth_requestAccounts') {
        res.result = ['0x12345'];
        return;
      }

      await next();
      console.log('metamask handled the request: ', req);
    });
  };
}
