import PortStream from 'extension-port-stream';
import { detect } from 'detect-browser';
import browser, { Runtime } from 'webextension-polyfill';
import { Duplex } from 'stream';
import pump from 'pump';
import { createAsyncMiddleware, JsonRpcEngine } from 'json-rpc-engine';
import {
  createEngineStream,
  createStreamMiddleware,
} from 'json-rpc-middleware-stream';
import { setupMultiplex } from '../utils';

// taken from https://github.com/MetaMask/providers/blob/0c0eb500c76e7c03c7e9c9133ec2eaa311000cf0/src/extension-provider/external-extension-config.json
const MM_EXTENSION_ID = {
  CHROME: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  FIREFOX: 'webextension@metamask.io',
};

chrome.runtime.onConnect.addListener((port) => {
  console.log('got incoming connection from: ', port);
  const stream = new PortStream(port as Runtime.Port) as unknown as Duplex;
  if (port.name === 'voyage-popup') {
    setupPopupConnection(stream);
  } else {
    setupInpageProviderConnection(stream);
  }
  stream.on('data', (data) => {
    console.log(`background got data from ${port.name}: `, data);
  });
});

/**
 * Sets up a connection between the Voyage provider and the MetaMask background script
 * @param inpageStream
 */
function setupInpageProviderConnection(inpageStream: Duplex) {
  const metaMaskStream = connectToMetaMask();
  const metaMaskMiddleware = createStreamMiddleware();
  pump(
    metaMaskMiddleware.stream,
    metaMaskStream,
    metaMaskMiddleware.stream,
    () => console.log('disconnected from metamask provider')
  );
  const engine = new JsonRpcEngine();
  // intercept and handle some methods
  const voyageMiddleware = createAsyncMiddleware(async (req, res, next) => {
    console.log('processing request from inpage provider: ', req);
    if (req.method === 'eth_requestAccounts') {
      res.result = ['0x12345'];
      return;
    }

    await next();
    console.log('metamask handled the request: ', req);
  });
  engine.push(voyageMiddleware);
  engine.push(metaMaskMiddleware.middleware);

  // connect the voyage provider stream to the rpc engine
  const engineStream = createEngineStream({ engine });
  const mux = setupMultiplex(inpageStream);
  const providerStream = mux.createStream('voyage-provider');
  pump(providerStream, engineStream, providerStream, () =>
    console.log('disconnected from inpage provider stream')
  );
}

/**
 * Sets up a direction connection to the MetaMask external provider.
 * @param popupStream
 */
function setupPopupConnection(popupStream: Duplex) {
  const metaMaskStream = connectToMetaMask();
  pump(popupStream, metaMaskStream, popupStream);
}

function getMetaMaskExtensionId() {
  const browserInfo = detect();
  switch (browserInfo?.name) {
    case 'firefox':
      return MM_EXTENSION_ID.FIREFOX;
    case 'chrome':
    default:
      return MM_EXTENSION_ID.CHROME;
  }
}

/**
 * Connects to MetaMask via Port
 */
function connectToMetaMask() {
  const currentMetaMaskId = getMetaMaskExtensionId();
  const metaMaskPort = browser.runtime.connect(currentMetaMaskId);
  return new PortStream(metaMaskPort);
}
