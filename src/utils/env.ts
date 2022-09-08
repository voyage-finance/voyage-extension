import { ethers } from 'ethers';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { ChainID } from './chain';

export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
  Rinkeby = 'rinkeby',
  Localhost = 'local',
}

export enum VoyageContracts {
  Voyage,
}

export interface NetworkConfiguration {
  name: string;
  apiKey?: string;
  endpoint: string;
  chaindId: number;
  contracts: Record<VoyageContracts.Voyage, string>;
}

export const NetworkConfigurationMap: Record<Network, NetworkConfiguration> = {
  [Network.Goerli]: {
    name: Network.Goerli,
    apiKey: process.env.GOERLI_API_KEY,
    endpoint: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    chaindId: ChainID.Goerli,
    contracts: {
      [VoyageContracts.Voyage]: '0x62e6aD57CB3C2bd1bfFf2B33d0539753E7aeEBA6',
    },
  },
  [Network.Rinkeby]: {
    name: Network.Rinkeby,
    apiKey: process.env.RINKEBY_API_KEY,
    endpoint: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY_API_KEY}`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [VoyageContracts.Voyage]: '0xc317754a23F2C9599218b183FC2F1c762a794551',
    },
  },
  [Network.Localhost]: {
    name: Network.Localhost,
    apiKey: process.env.RINKEBY_API_KEY,
    endpoint: `http://localhost:8545`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [VoyageContracts.Voyage]: '0xc317754a23F2C9599218b183FC2F1c762a794551',
    },
  },
  [Network.Mainnet]: {
    name: Network.Mainnet,
    apiKey: process.env.MAINNET_API_KEY,
    endpoint: ``,
    chaindId: ChainID.Mainnet,
    contracts: {
      [VoyageContracts.Voyage]: '',
    },
  },
};

export const getNetworkEnvironment = () => {
  const env = (process.env.NETWORK_ENV as Network) || Network.Localhost;
  console.log('network env: ', env);
  return env;
};

export const getNetworkConfiguration = () =>
  NetworkConfigurationMap[getNetworkEnvironment()];

export const getAlchemyProvider = () =>
  alchemyProvider({ apiKey: getNetworkConfiguration().apiKey });

export const getJsonProvider = () => {
  switch (getNetworkEnvironment()) {
    case Network.Rinkeby:
      return new ethers.providers.AlchemyProvider(
        getNetworkConfiguration().name,
        getNetworkConfiguration().apiKey
      );
    case Network.Localhost:
    default:
      return new ethers.providers.JsonRpcProvider(
        getNetworkConfiguration().endpoint,
        {
          chainId: getNetworkConfiguration().chaindId,
          name: getNetworkConfiguration().name,
        }
      );
  }
};
