import WalletConnect from '@walletconnect/client';
import { Duplex } from 'readable-stream';
import { noop } from 'lodash';

export const createWcStream = (connection: WalletConnect) => {
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
    console.log('call_request: ', payload);
    stream.push({
      ...payload,
      params: [...payload.params, connection.peerMeta],
    });
  });

  const write = (res: any) => {
    console.log('res: ', res);
    // if we get a successful response, we should approveRequest
    if (res.result) {
      console.log('[wc] approving', res.id);
      connection.approveRequest(res);
    }
  };
  const stream = new Duplex({ objectMode: true, read: noop, write: write });
  return stream;
};
