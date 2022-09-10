import PortStream from 'extension-port-stream';
import { Runtime } from 'webextension-polyfill';
import { setupMultiplex } from '@utils/index';
import { Duplex } from 'stream';
import { BaseProvider } from '@voyage-finance/providers';

const bgPort = chrome.runtime.connect({ name: 'voyage-contentscript' });
const bgStream = new PortStream(bgPort as Runtime.Port);
const mux = setupMultiplex(bgStream as unknown as Duplex, 'bootstrap');

//eslint-disable-next-line
const controller = mux.createStream('controller');
//eslint-disable-next-line
const provider = new BaseProvider(mux.createStream('provider') as Duplex);

const buttons = window.document.querySelectorAll('button');
const buyNow = Array.from(buttons).find((btn) =>
  btn?.innerText.includes('Buy now')
);

console.log('buy now button: ', buyNow);
if (!document.getElementById('vyg-buy-now')) {
  const voyageBuyNow = document.createElement('button');
  voyageBuyNow.className = 'voyageBNPL';
  voyageBuyNow.innerText = 'Buy with Voyage';
  document.body.appendChild(voyageBuyNow);
  // when clicked, we can use the provider or controller to send messages
  // for now, this is a POC and just logs a line
  voyageBuyNow.onclick = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log('buying now with voyage');
  };
}
