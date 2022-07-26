import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { Duplex } from 'stream';

/**
 * Sets up stream multiplexing for the given stream
 *
 * @param {Duplex} connectionStream - the stream to mux
 * @param {string} name - the name of the stream, used for logging.
 * @returns {ObjectMultiplex} the multiplexed stream
 */
export function setupMultiplex(connectionStream: Duplex, name?: string) {
  const mux = new ObjectMultiplex();
  pump(connectionStream, mux, connectionStream, (err) => {
    if (err) {
      console.error(`[${name}] error in mux: `, err);
    }
  });
  return mux;
}
