import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@voyage-finance/providers';
import { Duplex } from 'stream';

const connectionStream = new WindowPostMessageStream({
  name: 'voyage-injector',
  target: 'voyage-contentscript',
}) as Duplex;

initializeProvider({
  connectionStream,
});

(async function () {
  const res = await window.voyage.request({ method: 'eth_requestAccounts' });
  console.log('inpage received response: ', res);
})();
