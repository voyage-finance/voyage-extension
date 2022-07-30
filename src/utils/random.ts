import { utils } from 'ethers';

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

export function createRandomFingerprint() {
  var byteArray = utils.randomBytes(6);
  var emojiArray = [];

  for (const byte of byteArray) {
    var emoji = DEVICE_EMOJIS[byte];

    if (!emoji) {
      console.error(byte);
    }

    emojiArray.push(emoji);
  }

  return emojiArray.join('');
}

//prettier-ignore
const DEVICE_EMOJIS: string[] = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🌱','🌿','🍀','🎍','🎋','🍃','👣','🍂','🍁','🍄','🐚','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','👀','👂','👃','👄','👅','👆','👇','👈','👉','👊','👋','👌','👍','👎','👏','👐','👑','👒','👓','🎯','🎰','🎱','🎲','🎳','👾','👯','👺','👻','👽','🏂','🏃','🏄','🏄',
];
