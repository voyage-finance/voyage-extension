import { ethers } from 'ethers';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { ChainID } from './chain';
import {
  LOOKS_EXCHANGE_RINKEBY,
  SEAPORT_EXCHANGE_RINKEBY,
  VOYAGE_RINKEBY,
} from './constants';

export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
  Rinkeby = 'rinkeby',
  Localhost = 'localhost',
}

export enum Contracts {
  Voyage = 'voyage',
  LooksRare = 'looksrare',
  Seaport = 'opensea',
}

type AddressToContract = Record<string, Contracts>;

export interface NetworkConfiguration {
  name: string;
  apiKey?: string;
  endpoint: string;
  chaindId: number;
  contracts: Record<Contracts, string>;
  addressToContract: AddressToContract;
}

export const NetworkConfigurationMap: Record<Network, NetworkConfiguration> = {
  [Network.Goerli]: {
    name: Network.Goerli,
    apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
    endpoint: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    chaindId: ChainID.Goerli,
    contracts: {
      [Contracts.Voyage]: VOYAGE_RINKEBY,
      [Contracts.LooksRare]:
        '0xd112466471b5438c1ca2d218694200e49d81d047'.toLowerCase(),
      [Contracts.Seaport]:
        '0x00000000006c3852cbef3e08e8df289169ede581'.toLowerCase(),
    },
    addressToContract: {
      VOYAGE_RINKEBY: Contracts.Voyage,
      '0xd112466471b5438c1ca2d218694200e49d81d047': Contracts.LooksRare,
      '0x00000000006c3852cbef3e08e8df289169ede581': Contracts.Seaport,
    },
  },
  [Network.Rinkeby]: {
    name: Network.Rinkeby,
    apiKey: process.env.ALCHEMY_RINKEBY_API_KEY,
    endpoint: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY_API_KEY}`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [Contracts.Voyage]: VOYAGE_RINKEBY,
      [Contracts.LooksRare]: LOOKS_EXCHANGE_RINKEBY,
      [Contracts.Seaport]: SEAPORT_EXCHANGE_RINKEBY,
    },
    addressToContract: {
      [VOYAGE_RINKEBY]: Contracts.Voyage,
      [LOOKS_EXCHANGE_RINKEBY]: Contracts.LooksRare,
      [SEAPORT_EXCHANGE_RINKEBY]: Contracts.Seaport,
    },
  },
  [Network.Localhost]: {
    name: Network.Localhost,
    apiKey: process.env.ALCHEMY_RINKEBY_API_KEY,
    endpoint: `http://localhost:8545`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [Contracts.Voyage]: VOYAGE_RINKEBY,
      [Contracts.LooksRare]: LOOKS_EXCHANGE_RINKEBY,
      [Contracts.Seaport]: SEAPORT_EXCHANGE_RINKEBY,
    },
    addressToContract: {
      [VOYAGE_RINKEBY]: Contracts.Voyage,
      [LOOKS_EXCHANGE_RINKEBY]: Contracts.LooksRare,
      [SEAPORT_EXCHANGE_RINKEBY]: Contracts.Seaport,
    },
  },
  [Network.Mainnet]: {
    name: Network.Mainnet,
    apiKey: process.env.MAINNET_API_KEY,
    endpoint: ``,
    chaindId: ChainID.Mainnet,
    contracts: {
      [Contracts.Voyage]: '',
      [Contracts.LooksRare]: '',
      [Contracts.Seaport]: '',
    },
    addressToContract: {
      '0x4aFb3904e9f0615Aa15eb3208484BdcE7595bb79': Contracts.Voyage,
      '0x1aa777972073ff66dcfded85749bdd555c0665da': Contracts.LooksRare,
      '0x00000000006c3852cbEf3e08E8dF289169EdE581': Contracts.Seaport,
    },
  },
};

export const getContractByAddress = (address: string) =>
  NetworkConfigurationMap[getNetworkEnvironment()].addressToContract[address];

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
