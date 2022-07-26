import { ethers } from 'ethers';
import { createAsyncMiddleware } from 'json-rpc-engine';

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
