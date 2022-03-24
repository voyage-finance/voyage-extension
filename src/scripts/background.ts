import { Runtime } from 'webextension-polyfill-ts';
import PortStream from 'extension-port-stream';

chrome.runtime.onConnect.addListener((port) => {
  console.log('got incoming connection from: ', port);
  const stream = new PortStream(port as Runtime.Port);
  stream.on('data', (data) => {
    console.log(`background got data from ${port.name}: `, data);
  });
});
