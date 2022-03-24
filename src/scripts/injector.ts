import { WindowPostMessageStream } from '@metamask/post-message-stream';
const voyageStream = new WindowPostMessageStream({
  name: 'voyage-injector',
  target: 'voyage-contentscript',
});

window.voyageStream = voyageStream;
voyageStream.write('hello');
