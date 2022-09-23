import { BaseProvider } from '@voyage-finance/providers';
import PortStream from 'extension-port-stream';
import { Duplex } from 'stream';
import browser from 'webextension-polyfill';
import controllerFactory from '../../rpc/virtual/client';
import { setupMultiplex } from '../../utils';

let initialised = false;

/**
 * Initialises singleton connection to the MetaMask provider and the VoyageController.
 * Both are accessible via `globalThis`.
 */
export const initWeb3 = () => {
  if (initialised) {
    return {
      controller: globalThis.controller,
      provider: globalThis.provider,
    };
  }

  const port = browser.runtime.connect({ name: 'voyage-popup' });
  const backgroundStream = new PortStream(port) as unknown as Duplex;
  const mux = setupMultiplex(backgroundStream);
  const controller = controllerFactory(
    mux.createStream('controller') as Duplex
  );
  const provider = new BaseProvider(mux.createStream('provider') as Duplex);

  globalThis.controller = controller;
  globalThis.provider = provider;

  initialised = true;

  return { controller, provider };
};
