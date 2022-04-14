import { Duplex } from 'stream';
import browser from 'webextension-polyfill';
import PortStream from 'extension-port-stream';
import { getMetaMaskExtensionId, setupMultiplex } from '../utils';
import pump from 'pump';
import { createAsyncMiddleware, JsonRpcEngine } from 'json-rpc-engine';
import {
  createEngineStream,
  createStreamMiddleware,
} from 'json-rpc-middleware-stream';

export class VoyageController {
  engine: JsonRpcEngine;
  constructor() {
    this.engine = this.createRpcEngine();
  }

  /**
   * Sets up a direct pass through stream to the MetaMask provider backend.
   * This provider is exclusively used internally by the Voyage extension (UI and background).
   * @param stream
   */
  setupMetaMaskProviderConnection = (stream: Duplex) => {
    try {
      const engineStream = createEngineStream({ engine: this.engine });
      pump(stream, engineStream, stream);
    } catch (err) {
      console.log('error in mm conn: ', err);
    }
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
    engine.push(this.createVoyageMiddleware());
    engine.push(this.engine.asMiddleware());
    const engineStream = createEngineStream({ engine });
    pump(stream, engineStream, stream, () =>
      console.log('disconnected from inpage provider stream')
    );
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
    // intercept and handle some methods
    engine.push(metaMaskMiddleware.middleware);
    return engine;
  };

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
