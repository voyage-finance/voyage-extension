import PortStream from 'extension-port-stream';
import browser, { Runtime } from 'webextension-polyfill';
import { Duplex } from 'stream';
import { VoyageController } from '../controller';
import { setupMultiplex } from '../utils';
import { KeyStoreStage } from 'controller/types';

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

  controller.store.voyageStore.listenVaultCreate((...args) => {
    console.log('----- [listenVaultCreate] -------', args);
  });

  browser.action.onClicked.addListener(() => {
    if (controller.getState().stage === KeyStoreStage.Initialized) {
      browser.action.setPopup({ popup: 'popup.html' });
    } else {
      browser.tabs.create({ url: 'popup.html' });
    }
  });
}

bootstrapSW();
