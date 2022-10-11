import * as Sentry from '@sentry/browser';
import PortStream from 'extension-port-stream';
import { Duplex } from 'stream';
import browser, { Runtime } from 'webextension-polyfill';
import { VoyageController } from '../controller';
import { setupMultiplex } from '../utils';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
});

async function bootstrapSW() {
  const controller = new VoyageController();
  await controller.init();

  browser.runtime.onConnect.addListener((port) => {
    const stream = new PortStream(port as Runtime.Port) as unknown as Duplex;
    const mux = setupMultiplex(stream, 'bootstrap');
    const endStream = () => stream.end();
    port.onDisconnect.addListener(endStream);
    controller.setupControllerConnection(
      mux.createStream('controller') as Duplex
    );
    controller.setupVoyageProviderConnection(
      mux.createStream('provider') as Duplex
    );
  });

  browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: 'home.html' });
  });
}

bootstrapSW();
