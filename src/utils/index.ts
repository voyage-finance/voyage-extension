import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { Duplex } from 'stream';
import { detect } from 'detect-browser';

/**
 * Sets up stream multiplexing for the given stream
 *
 * @param {Duplex} connectionStream - the stream to mux
 * @returns {ObjectMultiplex} the multiplexed stream
 */
export function setupMultiplex(connectionStream: Duplex) {
  const mux = new ObjectMultiplex();
  pump(connectionStream, mux, connectionStream, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return mux;
}

export function getMetaMaskExtensionId() {
  const browserInfo = detect();
  switch (browserInfo?.name) {
    case 'firefox':
      return MM_EXTENSION_ID.FIREFOX;
    case 'chrome':
    default:
      return MM_EXTENSION_ID.CHROME;
  }
}

// taken from https://github.com/MetaMask/providers/blob/0c0eb500c76e7c03c7e9c9133ec2eaa311000cf0/src/extension-provider/external-extension-config.json
const MM_EXTENSION_ID = {
  CHROME: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  FIREFOX: 'webextension@metamask.io',
};
