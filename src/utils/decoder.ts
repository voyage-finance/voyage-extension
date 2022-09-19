import { TransactionRequest } from '@ethersproject/providers';
import { ABIs } from '@utils/abi';
import { Contracts, getContractByAddress } from '@utils/env';
import { Weth9__factory } from 'contracts/factories/Weth9__factory';
import { BytesLike, ethers } from 'ethers';

interface BuyNowParams {
  marketplace: string;
  collection: string;
  tokenId: ethers.BigNumber;
  data: BytesLike;
}

export const decodeMarketplaceCalldata = (
  transaction: TransactionRequest
): BuyNowParams => {
  if (!transaction.data || !transaction.to)
    throw new Error('Invalid transaction');
  const selector = ethers.utils.hexlify(transaction.data).slice(0, 10);
  const contract = getContractByAddress(transaction.to.toLowerCase());
  const abi = ABIs[contract];
  console.log('[decodeMarketplaceCalldata] selector', selector);
  if (!abi)
    throw new Error(`${transaction.to} is not a supported destination address`);
  const instance = new ethers.Contract(transaction.to, abi);
  switch (contract) {
    case Contracts.LooksRare: {
      const args: any = instance.interface.decodeFunctionData(
        selector,
        transaction.data
      );
      console.log('looksrare args: ', args);
      return {
        marketplace: transaction.to,
        collection: args.makerAsk.collection,
        tokenId: args.makerAsk.tokenId,
        data: transaction.data,
      };
    }
    case Contracts.Seaport: {
      const args: any = instance.interface.decodeFunctionData(
        selector,
        transaction.data
      );
      console.log('seaport args: ', args);
      return {
        marketplace: transaction.to,
        collection: args.parameters.offerToken.toLowerCase(),
        tokenId: args.parameters.offerIdentifier,
        data: transaction.data,
      };
    }
    default:
      throw new Error(
        `Unsupported transaction: ${JSON.stringify(transaction)}`
      );
  }
};

export const decodeMarketplaceFromApproveCalldata = (
  calldata: string
): string => {
  const selector = ethers.utils.hexlify(calldata).slice(0, 10);
  const args: any = Weth9__factory.createInterface().decodeFunctionData(
    selector,
    calldata
  );
  console.log('[weth] approve args: ', args);

  return args.guy;
};
