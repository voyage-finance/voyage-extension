import WalletConnect from '@walletconnect/client';
import { Duplex } from 'readable-stream';
import { noop } from 'lodash';

export const createWcStream = (connection: WalletConnect) => {
  const stream = new Duplex({ objectMode: true, read: noop, write: write });

  connection.on('disconnect', (err, payload) => {
    if (err) {
      console.error('ending wc stream err: ', err);
    }
    console.log('ending wc stream: ', payload);
    stream.end();
  });

  connection.on('call_request', (err, payload) => {
    if (err) {
      console.error('call_request error: ', err);
      return;
    }
    console.log('[wcStream] call_request: ', payload);
    stream.push({
      ...payload,
      params: [...payload.params, connection.peerMeta],
    });
  });

  function write(res: any, _: unknown, cb: (err?: Error) => void) {
    console.log('[wc] res: ', res);
    // if we get a successful response, we should approveRequest
    if (res.result) {
      console.log('[wc] approving: ', res.id);
      connection.approveRequest(res);
      cb();
      return;
    }

    if (res.error) {
      console.log('[wc] rejected request: ', res);
      connection.rejectRequest(res);
      cb();
      return;
    }

    cb();
  }

  return stream;
};
