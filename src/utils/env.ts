import { alchemyProvider } from 'wagmi/providers/alchemy';

export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
  Rinkeby = 'rinkeby',
}

export enum VoyageContracts {
  Voyage,
}

export const NetworkConfigurationMap = {
  [Network.Goerli]: {
    name: Network.Goerli,
    apiKey: process.env.GOERLI_API_KEY,
    contracts: {
      [VoyageContracts.Voyage]: '0x62e6aD57CB3C2bd1bfFf2B33d0539753E7aeEBA6',
    },
  },
  [Network.Rinkeby]: {
    name: Network.Rinkeby,
    apiKey: process.env.RINKEBY_API_KEY,
    contracts: {
      [VoyageContracts.Voyage]: '0xc317754a23F2C9599218b183FC2F1c762a794551',
    },
  },
  [Network.Mainnet]: {
    name: Network.Mainnet,
    apiKey: process.env.MAINNET_API_KEY,
    contracts: {
      [VoyageContracts.Voyage]: '',
    },
  },
};

export const getNetworkEnvironment = () => {
  const env = (process.env.NETWORK_ENV as Network) || Network.Goerli;
  console.log('network env: ', env);
  return env;
};

export const getNetworkConfiguration = () =>
  NetworkConfigurationMap[getNetworkEnvironment()];

export const getAlchemyProvider = () =>
  alchemyProvider({ apiKey: getNetworkConfiguration().apiKey });
