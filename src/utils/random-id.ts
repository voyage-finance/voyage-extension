const MAX = Number.MAX_SAFE_INTEGER;

let idCounter = Math.round(Math.random() * MAX);

/**
 * Returns a random id.
 * Directly lifted from https://github.com/MetaMask/metamask-extension/blob/b50fe3184ac82344af256db901e5c0bc08ebc956/shared/modules/random-id.js
 */
export default function createRandomId() {
  idCounter %= MAX;
  // eslint-disable-next-line no-plusplus
  return idCounter++;
}
