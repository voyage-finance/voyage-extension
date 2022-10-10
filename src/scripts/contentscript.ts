import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import { LOOKS_HOSTS, Marketplace, OPENSEA_HOSTS } from '@utils/constants';
import { config } from '@utils/env';
import { setupMultiplex } from '@utils/index';
import { BaseProvider } from '@voyage-finance/providers';
import { NFTData, OrderData } from 'controller/store/types';
import PortStream from 'extension-port-stream';
import { debounce } from 'lodash';
import controllerFactory from 'rpc/virtual/client';
import { Duplex } from 'stream';
import { Runtime } from 'webextension-polyfill';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
});

const bgPort = chrome.runtime.connect({ name: 'voyage-contentscript' });
const bgStream = new PortStream(bgPort as Runtime.Port);
const mux = setupMultiplex(bgStream as unknown as Duplex, 'bootstrap');
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

function getMarketplace(): Marketplace | undefined {
  const host = window.location.host;
  const os = OPENSEA_HOSTS[config.chainId];
  const looks = LOOKS_HOSTS[config.chainId];
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

function extractLooksData(path: string): NFTData | undefined {
  const [, collection, tokenId] = path.match(LOOKS_ITEM_PATH_RE) ?? [];
  return { collection, tokenId };
}

const OS_ITEM_PATH_RE = /^\/assets\/[a-z]+\/(0x[a-fA-F0-9]{40})\/([0-9]+)$/i;

function extractOSData(path: string): NFTData | undefined {
  const [, collection, tokenId] = path.match(OS_ITEM_PATH_RE) ?? [];
  return { collection, tokenId };
}

function extractOrderData(
  path: string,
  marketplace: Marketplace
): OrderData | undefined {
  switch (marketplace) {
    case Marketplace.Looks: {
      const orderData = extractLooksData(path);
      if (orderData) return { ...orderData, marketplace };
      break;
    }
    case Marketplace.Opensea: {
      const orderData = extractOSData(path);
      if (orderData) return { ...orderData, marketplace };
      break;
    }
    default:
      return;
  }
  return;
}

let currentButton: HTMLElement | null = null;
const pathnameCache: Record<string, OrderData> = {};

function setButtonLoading(status: boolean) {
  const textNode = currentButton?.childNodes[0];
  if (textNode) {
    if (status) {
      textNode.nodeValue = 'Unfurling sails...';
    } else {
      textNode.nodeValue = 'Buy with Voyage';
    }
  }
}

async function dispatchOrder(order: OrderData) {
  try {
    setButtonLoading(true);
    await controller.createOrder(order);
  } finally {
    setButtonLoading(false);
  }
}

function createButtonNode(order: OrderData, marketplace: Marketplace) {
  const voyageButton = document.createElement('button');
  const text = document.createTextNode('Buy with Voyage');
  const className =
    marketplace === Marketplace.Looks ? 'voyage-btn--looks' : 'voyage-btn--os';
  voyageButton.appendChild(text);
  voyageButton.id = 'voyage-btn';
  voyageButton.classList.add('voyage-btn');
  voyageButton.classList.add(className);
  voyageButton.dataset.id = 'voyage-bnpl-button';
  voyageButton.dataset.collection = order.collection;
  voyageButton.dataset.tokenId = order.tokenId;
  voyageButton.onclick = () => {
    dispatchOrder(order);
  };
  return voyageButton;
}

function getLooksButton(): HTMLElement {
  const buyNowButton = document.querySelector('[data-id="buy-now-button"]');
  return buyNowButton as HTMLElement;
}

const OS_BTN_COPY = 'Add to cart';

function getOSButton(): HTMLElement {
  const buttons = document.querySelectorAll('button');
  let buyNowButton: HTMLElement | null = null;
  for (const btn of buttons) {
    if (
      btn.innerText.includes(OS_BTN_COPY) ||
      btn.textContent?.includes(OS_BTN_COPY)
    ) {
      buyNowButton = btn as HTMLElement;
      break;
    }
  }
  if (buyNowButton !== null) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    buyNowButton = buyNowButton.parentElement!;
  }

  return buyNowButton as HTMLElement;
}

function getBuyButton(marketplace: Marketplace): HTMLElement | null {
  let buyButton: HTMLElement | null = null;
  switch (marketplace) {
    case Marketplace.Looks:
      buyButton = getLooksButton();
      break;
    case Marketplace.Opensea:
      buyButton = getOSButton();
      break;
  }
  return buyButton;
}

function insertButton(order: OrderData, marketplace: Marketplace) {
  const buyButton = getBuyButton(marketplace);
  if (!buyButton) {
    console.error(
      'Failed to locate the native marketplace buy button. Aborting.'
    );
    return;
  }
  const container = buyButton.parentElement;
  if (container === null) {
    console.error('The buy button has no container. Aborting.');
    return;
  }

  if (currentButton) {
    if (
      currentButton.dataset.collection === order.collection &&
      currentButton.dataset.tokenId === order.tokenId &&
      document.body.contains(currentButton)
    ) {
      // in this case we already injected. do nothing.
      return;
    } else {
      // we did inject but we have now navigated to another page.
      currentButton.remove();
    }
  }
  const vButton = createButtonNode(order, marketplace);
  container.insertBefore(vButton, buyButton);
  currentButton = vButton;
}

async function init() {
  await documentFullyLoaded();
  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false };

  function observerCallback() {
    const marketplace = getMarketplace();
    if (!marketplace || marketplace === Marketplace.Unsupported) {
      return;
    }
    const order =
      pathnameCache[document.location.pathname] ??
      extractOrderData(window.location.pathname, marketplace);
    if (order && order.collection && order.tokenId) {
      insertButton(order, marketplace);
    }
  }

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(
    debounce(observerCallback, 500, { leading: true, trailing: true })
  );

  // Start observing the target node for configured mutations
  observer.observe(document.body, config);
}

init();
