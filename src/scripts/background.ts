import PortStream from 'extension-port-stream';
import { detect } from 'detect-browser';
import browser, { Runtime } from 'webextension-polyfill';
import { Duplex } from 'stream';
import pump from 'pump';

// taken from https://github.com/MetaMask/providers/blob/0c0eb500c76e7c03c7e9c9133ec2eaa311000cf0/src/extension-provider/external-extension-config.json
const MM_EXTENSION_ID = {
  CHROME: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  FIREFOX: 'webextension@metamask.io',
};

chrome.runtime.onConnect.addListener((port) => {
  console.log('got incoming connection from: ', port);
  const stream = new PortStream(port as Runtime.Port) as unknown as Duplex;
  if (port.name === 'voyage-popup') {
    setupPopupProvider(stream);
  }
  stream.on('data', (data) => {
    console.log(`background got data from ${port.name}: `, data);
  });
});

function setupPopupProvider(popupStream: Duplex) {
  const currentMetaMaskId = getMetaMaskExtensionId();
  const metaMaskPort = browser.runtime.connect(currentMetaMaskId);
  const metaMaskStream = new PortStream(metaMaskPort);
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
