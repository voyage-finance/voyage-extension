import { ethErrors, serializeError } from 'eth-rpc-errors';
import { Duplex } from 'stream';
import { JsonRpcRequest } from 'json-rpc-engine';

/**
 * Creates a virtual RPC server that relays incoming RPC requests to the VoyageController API.
 * Directly lifted from https://github.com/MetaMask/metamask-extension/blob/5076e5057f0e93c9b49dcb3a13d7e0f40d8a0559/app/scripts/lib/createMetaRPCHandler.js
 * @param api
 * @param outStream
 */
const createMetaRPCHandler = (api: any, outStream: Duplex) => {
  return async (data: JsonRpcRequest<any>) => {
    console.log('controller rpc received request: ', data);
    if (outStream.writableEnded) {
      return;
    }
    if (!Reflect.has(api, data.method)) {
      outStream.write({
        jsonrpc: '2.0',
        error: ethErrors.rpc.methodNotFound({
          message: `${data.method} not found`,
        }),
        id: data.id,
      });
      return;
    }

    let result;
    let error;
    try {
      result = await Reflect.get(api, data.method)(...data.params);
    } catch (err) {
      error = err;
    }

    if (outStream.writableEnded) {
      if (error) {
        console.error(error);
      }
      return;
    }

    if (error) {
      outStream.write({
        jsonrpc: '2.0',
        error: serializeError(error, { shouldIncludeStack: true }),
        id: data.id,
      });
    } else {
      outStream.write({
        jsonrpc: '2.0',
        result,
        id: data.id,
      });
    }
  };
};

export default createMetaRPCHandler;
