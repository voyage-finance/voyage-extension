import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@voyage-finance/providers';
import { Duplex } from 'stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';

const connectionStream = new WindowPostMessageStream({
  name: 'voyage-injector',
  target: 'voyage-contentscript',
}) as Duplex;

initializeProvider({
  connectionStream,
});

const mux = new ObjectMultiplex();
pump(connectionStream, mux, connectionStream, () => {
  console.error('DOM stream ended unexpectedly');
});
const domStream = mux.createStream('voyage-dom');
domStream.on('end', () => {
  console.error('dom stream ended!');
});
domStream.on('data', (data) => {
  console.log('dom stream received message: ', data);
});

// const buttons = window.document.querySelectorAll('button');
// const buyNow = Array.from(buttons).find((btn) =>
//   btn?.innerText.includes('Buy now')
// );

// console.log('buy now button: ', buyNow);
// if (!document.getElementById('vyg-buy-now')) {
//   const voyageBuyNow = document.createElement('button');
//   voyageBuyNow.className = 'voyageBNPL';
//   voyageBuyNow.innerText = 'Buy with Voyage';
//   document.body.appendChild(voyageBuyNow);
//   voyageBuyNow.onclick = function (evt) {
//     evt.stopPropagation();
//     evt.preventDefault();
//     console.log('buying now with voyage');
//   };
// }

// (async function () {
//   const res = await window.voyage.request({ method: 'eth_requestAccounts' });
//   console.log('inpage received response: ', res);
// })();
