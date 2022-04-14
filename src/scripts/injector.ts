import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { Duplex } from 'stream';

const voyageStream = new WindowPostMessageStream({
  name: 'voyage-injector',
  target: 'voyage-contentscript',
});
const provider = new MetaMaskInpageProvider(voyageStream as unknown as Duplex, {
  jsonRpcStreamName: 'voyage-provider',
});
window.voyage = provider;
window.dispatchEvent(new Event('voyage#initialized'));
(async function () {
  const res = await provider.request({ method: 'eth_requestAccounts' });
  console.log('inpage received response: ', res);
})();
