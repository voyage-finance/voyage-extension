import { EthereumRpcError } from 'eth-rpc-errors';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { Duplex } from 'stream';
import createRandomId from '../../utils/random-id';
import { VoyageController } from '../../controller';

export class MetaRPCClient {
  connectionStream: Duplex;
  requests = new Map();
  notificationChannel = new SafeEventEmitter();
  uncaughtErrorChannel = new SafeEventEmitter();

  constructor(connectionStream: Duplex) {
    this.connectionStream = connectionStream;
    this.connectionStream.on('data', this.handleResponse.bind(this));
    this.connectionStream.on('end', this.close.bind(this));
  }

  onNotification(handler: any) {
    this.notificationChannel.addListener('notification', (data) => {
      handler(data);
    });
  }

  onUncaughtError(handler: any) {
    this.uncaughtErrorChannel.addListener('error', (error) => {
      handler(error);
    });
  }

  close() {
    this.notificationChannel.removeAllListeners();
    this.uncaughtErrorChannel.removeAllListeners();
  }

  handleResponse(data: any) {
    const { id, result, error, method, params } = data;
    const isNotification = id === undefined && error === undefined;
    const cb = this.requests.get(id);

    if (method && params && !isNotification) {
      // dont handle server-side to client-side requests
      return;
    }
    if (method && params && isNotification) {
      // handle servier-side to client-side notification
      this.notificationChannel.emit('notification', data);
      return;
    }

    if (error) {
      console.warn('error in eth cilent: ', JSON.stringify(error));
      const e = new EthereumRpcError(
        error.code,
        error.message || '',
        error.data || {}
      );
      // preserve the stack from serializeError
      e.stack = error.stack;
      if (cb) {
        this.requests.delete(id);
        cb(e);
        return;
      }
      this.uncaughtErrorChannel.emit('error', e);
      return;
    }

    if (!cb) {
      // not found in request list
      return;
    }

    this.requests.delete(id);

    cb(null, result);
  }
}

export type ControllerClient = PromisifyObj<VoyageController> & MetaRPCClient;

type Promisify<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R extends Promise<any> ? R : Promise<R>
  : T;
type PromisifyObj<T> = { [K in keyof T]: Promisify<T[K]> };

const controllerFactory = (connectionStream: Duplex): ControllerClient => {
  const metaRPCClient = new MetaRPCClient(connectionStream);
  return new Proxy(metaRPCClient, {
    get: (object, property) => {
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      }

      return (...params: any[]) => {
        const id = createRandomId();

        const res = new Promise((resolve, reject) => {
          object.requests.set(id, (err: any, res: any) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        object.connectionStream.write({
          jsonrpc: '2.0',
          method: property,
          params,
          id,
        });
        return res;
      };
    },
  }) as unknown as ControllerClient;
};

export default controllerFactory;
