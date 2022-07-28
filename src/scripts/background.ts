import PortStream from 'extension-port-stream';
import browser, { Runtime } from 'webextension-polyfill';
import { Duplex } from 'stream';
import { VoyageController } from '../controller';
import { setupMultiplex } from '../utils';

function bootstrapSW() {
  const controller = new VoyageController();
  controller.init();
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
    // browser.action.onClicked.addListener(() => {
    //   browser.tabs.create({ url: 'popup.html' });
    // });
  });
}

function checkForSignIn() {
  console.log('------- checkForSignIn -------');
  // check if user signup
  // if (browser.action && browser.action.onClicked)
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: 'popup.html' });
  });
  // browser.action.setPopup({ popup: 'popup.html' });
}

checkForSignIn();
bootstrapSW();
