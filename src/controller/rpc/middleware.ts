import VoyageRpcService from './service';
import { createAsyncMiddleware } from 'json-rpc-engine';
import { ethers } from 'ethers';

/**
 * Creates JsonRpcEngine middleware based on ethers.providers.JsonRpcProvider.
 * @param provider
 */
export const createProviderMiddleware = (
  provider: ethers.providers.JsonRpcProvider
) =>
  createAsyncMiddleware(async (req, res, next) => {
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
  return createAsyncMiddleware(async (req, res, next) => {
    switch (req.method) {
      case 'eth_accounts': {
        res.result = await service.handleEthAccounts();
        break;
      }
      default: // if we don't handle the method, pass it on to the next middleware.
        await next();
    }
  });
};
