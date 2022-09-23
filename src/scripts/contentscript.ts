import {
  ChainID,
  LOOKS_HOSTS,
  Marketplace,
  OPENSEA_HOSTS,
} from '@utils/constants';
import { setupMultiplex } from '@utils/index';
import { BaseProvider } from '@voyage-finance/providers';
import { OrderData } from 'controller/store/types';
import PortStream from 'extension-port-stream';
import { debounce } from 'lodash';
import controllerFactory from 'rpc/virtual/client';
import { Duplex } from 'stream';
import { Runtime } from 'webextension-polyfill';
import './contentscript.scss';

const bgPort = chrome.runtime.connect({ name: 'voyage-contentscript' });
const bgStream = new PortStream(bgPort as Runtime.Port);
const mux = setupMultiplex(bgStream as unknown as Duplex, 'bootstrap');
//eslint-disable-next-line
const controller = controllerFactory(mux.createStream('controller') as Duplex);

//eslint-disable-next-line
const provider = new BaseProvider(mux.createStream('provider') as Duplex);

async function documentFullyLoaded(): Promise<void> {
  return new Promise((resolve) => {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        resolve();
      }
    };
  });
}

function getMarketplace(): Marketplace {
  const host = window.location.host;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const os = OPENSEA_HOSTS[+process.env.CHAIN_ID! as ChainID];
  const looks = LOOKS_HOSTS[+process.env.CHAIN_ID! as ChainID];
  console.log('os: ', os);
  console.log('looks: ', looks);
  switch (host) {
    case os:
      return Marketplace.Opensea;
    case looks:
      return Marketplace.Looks;
    default:
      return Marketplace.Unsupported;
  }
}

const LOOKS_ITEM_PATH_RE = /^\/collections\/(0x[a-fA-F0-9]{40})\/([0-9]+)$/i;

function extractLooksData(
  path: string,
  marketplace: Marketplace
): OrderData | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, collection, tokenId] = path.match(LOOKS_ITEM_PATH_RE) ?? [];
  return { marketplace, collection, tokenId };
}

let currentButton: HTMLElement | null = null;
const pathnameCache: Record<string, OrderData> = {};

async function dispatchOrder(order: OrderData) {
  return await controller.createOrder(order);
}

function createButtonNode(order: OrderData) {
  const voyageButton = document.createElement('button');
  const text = document.createTextNode('Buy with Voyage');
  voyageButton.appendChild(text);
  voyageButton.classList.add('voyage--bnpl');
  voyageButton.dataset.id = 'voyage-bnpl-button';
  voyageButton.dataset.collection = order.collection;
  voyageButton.dataset.tokenId = order.tokenId;
  voyageButton.onclick = () => {
    dispatchOrder(order);
  };
  return voyageButton;
}

async function init() {
  await documentFullyLoaded();
  const marketplace = getMarketplace();
  if (marketplace === Marketplace.Unsupported) {
    return;
  }
  console.log(getMarketplace());
  console.log('location: ', location);
  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false };

  function observerCallback() {
    const order =
      pathnameCache[document.location.pathname] ??
      extractLooksData(window.location.pathname, marketplace);
    console.log('match: ', order);
    if (order) {
      const buyNowButton = document.querySelector('[data-id="buy-now-button"]');
      console.log('buy now buton: ', buyNowButton);
      // if we got the button let's replace it with our own
      if (buyNowButton) {
        if (currentButton) {
          if (
            currentButton.dataset.collection === order.collection &&
            currentButton.dataset.tokenId === order.tokenId
          ) {
            // in this case we already injected. do nothing.
            return;
          } else {
            // we did inject but we have now navigated to another page.
            currentButton.remove();
          }
        }
        const vButton = createButtonNode(order);
        buyNowButton?.parentNode?.insertBefore(vButton, buyNowButton);
        currentButton = vButton;
      }
    }
  }

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(
    debounce(observerCallback, 1000, { leading: false, trailing: true })
  );

  // Start observing the target node for configured mutations
  observer.observe(document.body, config);
}

init();
