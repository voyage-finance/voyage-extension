import { ChainID } from './constants';

export const getChainID = () => {
  const configuredChainID = process.env.CHAIN_ID || '5';
  return parseInt(configuredChainID, 10) as ChainID;
};
