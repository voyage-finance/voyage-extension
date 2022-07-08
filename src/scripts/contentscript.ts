import { WindowPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import PortStream from 'extension-port-stream';
import { Runtime } from 'webextension-polyfill';

const pageStream = new WindowPostMessageStream({
  name: 'voyage-contentscript',
  target: 'voyage-injector',
});

pageStream.on('data', (data) =>
  console.log('[content-script] got data from injector: ', data)
);

const bgPort = chrome.runtime.connect({ name: 'voyage-contentscript' });
const bgStream = new PortStream(bgPort as Runtime.Port);

pump(pageStream, bgStream, pageStream, (err) => {
  console.debug('failed to connect contentscript to background: ', err);
});
