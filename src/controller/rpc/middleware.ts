import VoyageRpcService from './service';
import { createAsyncMiddleware } from 'json-rpc-engine';
import { ethers } from 'ethers';
import { TransactionRequest } from '@ethersproject/providers';
import { IClientMeta } from '@walletconnect/types';

/**
 * Creates JsonRpcEngine middleware based on ethers.providers.JsonRpcProvider.
 * @param provider
 */
export const createProviderMiddleware = (
  provider: ethers.providers.JsonRpcProvider
) =>
  createAsyncMiddleware(async (req, res) => {
    try {
      res.result = await provider.send(req.method, req.params as unknown[]);
    } catch (error: any) {
      if (error.body) {
        throw JSON.parse(error.body as string);
      }
      throw error;
    }
  });

export const createVoyageMiddleware = (service: VoyageRpcService) => {
  //esli
  return createAsyncMiddleware(async (req, res, next) => {
    switch (req.method) {
      case 'eth_accounts': {
        res.result = await service.handleEthAccounts();
        break;
      }
      case 'personal_sign': {
        const [messageBytes, address, peerMeta] = req.params as any[];
        console.log('raw message: ', messageBytes);
        console.log(
          'as utf-8 from ethers: ',
          ethers.utils.toUtf8String(messageBytes)
        );
        const message = ethers.utils.toUtf8String(messageBytes);
        res.result = await service.handleEthSign(address, message, peerMeta);
        break;
      }
      case 'eth_sign': {
        const [address, message, peerMeta] = req.params as any[];
        res.result = await service.handleEthSign(address, message, peerMeta);
        break;
      }
      case 'eth_sendTransaction': {
        console.log('----- eth_sendTransaction --------', req.params);
        const params = req.params as unknown[];
        const txRequest = params[0] as TransactionRequest;
        let result;
        if (txRequest.data?.length === 138) {
          result = await service.handleApproveMarketplace(
            txRequest.data! as string,
            params[1] as IClientMeta
          );
        } else {
          result = await service.handleEthSendTx(txRequest);
        }
        console.log('---- eth_sendTransaction ----- result', result);
        res.result = result;
        break;
      }
      default: // if we don't handle the method, pass it on to the next middleware.
        console.log('req.method', req.method);
        await next();
    }
  });
};
