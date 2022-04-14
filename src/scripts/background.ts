import WalletConnect from '@walletconnect/client';
import PortStream from 'extension-port-stream';
import browser, { Runtime } from 'webextension-polyfill';
import { Duplex } from 'stream';
import { VoyageController } from '../controller';
import { setupMultiplex } from '../utils';

function bootstrapSW() {
  const controller = new VoyageController();
  browser.runtime.onConnect.addListener((port) => {
    console.log('got incoming connection from: ', port);
    const stream = new PortStream(port as Runtime.Port) as unknown as Duplex;
    const mux = setupMultiplex(stream);
    if (port.name === 'voyage-popup') {
      controller.setupMetaMaskProviderConnection(
        mux.createStream('metamask-provider') as Duplex
      );
    } else {
      controller.setupVoyageProviderConnection(
        mux.createStream('voyage-provider') as Duplex
      );
    }
  });
}

bootstrapSW();

async function connectWc() {
  const connector = new WalletConnect({
    uri: 'wc:fb587373-5c3b-432a-8dee-220c67f96b5b@1?bridge=https%3A%2F%2Fn.bridge.walletconnect.org&key=a85297a604cfa792bcd7ee1b40c965b3cfdc6f020ef451c117c866c6e1295ede',
    clientMeta: {
      description: 'Voyage Finance extension',
      url: 'https://voyage.finance',
      icons: ['https://walletconnect.org/walletconnect-logo.png'],
      name: 'Voyage Finance',
    },
  });

  await connector.createSession();

  connector.on('session_request', (error, payload) => {
    console.log('error from wc?: ', error);
    console.log('payload from wc?: ', payload);
    connector.approveSession({ chainId: 1337, accounts: ['0x12345'] });
  });

  console.log('wc client: ', connector);
}

connectWc();
