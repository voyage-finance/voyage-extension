import { ethers } from 'ethers';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { ChainID } from './chain';

export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
  Rinkeby = 'rinkeby',
  Localhost = 'localhost',
}

export enum Contracts {
  Voyage,
  LooksRare,
  Seaport,
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
    apiKey: process.env.GOERLI_API_KEY,
    endpoint: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    chaindId: ChainID.Goerli,
    contracts: {
      [Contracts.Voyage]: '0x62e6ad57cb3c2bd1bfff2b33d0539753e7aeeba6',
      [Contracts.LooksRare]: '0xd112466471b5438c1ca2d218694200e49d81d047',
      [Contracts.Seaport]: '0x00000000006cee72100d161c57ada5bb2be1ca79',
    },
    addressToContract: {
      '0x62e6ad57cb3c2bd1bfff2b33d0539753e7aeeba6': Contracts.Voyage,
      '0xd112466471b5438c1ca2d218694200e49d81d047': Contracts.LooksRare,
      '0x00000000006cee72100d161c57ada5bb2be1ca79': Contracts.Seaport,
    },
  },
  [Network.Rinkeby]: {
    name: Network.Rinkeby,
    apiKey: process.env.RINKEBY_API_KEY,
    endpoint: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY_API_KEY}`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [Contracts.Voyage]: '0xc317754a23f2c9599218b183fc2f1c762a794551',
      [Contracts.LooksRare]: '0x1aa777972073ff66dcfded85749bdd555c0665da',
      [Contracts.Seaport]: '0x00000000006cee72100d161c57ada5bb2be1ca79',
    },
    addressToContract: {
      '0xc317754a23f2c9599218b183fc2f1c762a794551': Contracts.Voyage,
      '0x1aa777972073ff66dcfded85749bdd555c0665da': Contracts.LooksRare,
      '0x00000000006cee72100d161c57ada5bb2be1ca79': Contracts.Seaport,
    },
  },
  [Network.Localhost]: {
    name: Network.Localhost,
    apiKey: process.env.RINKEBY_API_KEY,
    endpoint: `http://localhost:8545`,
    chaindId: ChainID.Rinkeby,
    contracts: {
      [Contracts.Voyage]: '0xc317754a23f2c9599218b183fc2f1c762a794551',
      [Contracts.LooksRare]: '0x1aa777972073ff66dcfded85749bdd555c0665da',
      [Contracts.Seaport]: '0x00000000006cee72100d161c57ada5bb2be1ca79',
    },
    addressToContract: {
      '0xc317754a23f2c9599218b183fc2f1c762a794551': Contracts.Voyage,
      '0x1aa777972073ff66dcfded85749bdd555c0665da': Contracts.LooksRare,
      '0x00000000006cee72100d161c57ada5bb2be1ca79': Contracts.Seaport,
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
      '0xc317754a23f2c9599218b183fc2f1c762a794551': Contracts.Voyage,
      '0x1aa777972073ff66dcfded85749bdd555c0665da': Contracts.LooksRare,
      '0x00000000006cee72100d161c57ada5bb2be1ca79': Contracts.Seaport,
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
