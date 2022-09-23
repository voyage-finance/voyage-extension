import { ethers } from 'ethers';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import {
  ChainID,
  LOOKS_EXCHANGE_TESTNET,
  SEAPORT_EXCHANGE_TESTNET,
  VOYAGE_GOERLI,
} from './constants';

export enum Network {
  Mainnet = 'mainnet',
  Goerli = 'goerli',
  Localhost = 'localhost',
}

export enum Contracts {
  Voyage = 'voyage',
  LooksRare = 'looksrare',
  Seaport = 'opensea',
  Paymaster = 'paymaster',
}

type AddressToContract = Record<string, Contracts>;

export interface NetworkConfiguration {
  name: string;
  apiKey?: string;
  explorer: string;
  endpoint: string;
  chaindId: number;
  contracts: Record<Contracts, string>;
  addressToContract: AddressToContract;
}

export const NetworkConfigurationMap: Record<Network, NetworkConfiguration> = {
  [Network.Goerli]: {
    name: Network.Goerli,
    apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
    explorer: 'https://goerli.etherscan.io/',
    endpoint: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    chaindId: ChainID.Goerli,
    contracts: {
      [Contracts.Voyage]: VOYAGE_GOERLI,
      [Contracts.LooksRare]: LOOKS_EXCHANGE_TESTNET,
      [Contracts.Seaport]: SEAPORT_EXCHANGE_TESTNET,
      // TODO: @ian use the VoyagePaymaster
      [Contracts.Paymaster]: '0x1181C3d48Dd70A162E88689377Da9341A95873d5',
    },
    addressToContract: {
      [VOYAGE_GOERLI]: Contracts.Voyage,
      [LOOKS_EXCHANGE_TESTNET]: Contracts.LooksRare,
      [SEAPORT_EXCHANGE_TESTNET]: Contracts.Seaport,
    },
  },
  [Network.Localhost]: {
    name: Network.Localhost,
    apiKey: process.env.ALCHEMY_RINKEBY_API_KEY,
    endpoint: `http://localhost:8545`,
    explorer: 'https://goerli.etherscan.io/',
    chaindId: ChainID.Goerli,
    contracts: {
      [Contracts.Voyage]: VOYAGE_GOERLI,
      [Contracts.LooksRare]: LOOKS_EXCHANGE_TESTNET,
      [Contracts.Seaport]: SEAPORT_EXCHANGE_TESTNET,
      [Contracts.Paymaster]: '',
    },
    addressToContract: {
      [VOYAGE_GOERLI]: Contracts.Voyage,
      [LOOKS_EXCHANGE_TESTNET]: Contracts.LooksRare,
      [SEAPORT_EXCHANGE_TESTNET]: Contracts.Seaport,
    },
  },
  [Network.Mainnet]: {
    name: Network.Mainnet,
    apiKey: process.env.MAINNET_API_KEY,
    endpoint: `https://eth-mainnet.g.alchemy.com/v2/_ugyedYRT9AOVAGTuXNVKSgFuauulnkC`,
    explorer: 'https://etherscan.io/',
    chaindId: ChainID.Mainnet,
    contracts: {
      [Contracts.Voyage]: '0x4aFb3904e9f0615Aa15eb3208484BdcE7595bb79',
      [Contracts.LooksRare]: '0x59728544B08AB483533076417FbBB2fD0B17CE3a',
      [Contracts.Seaport]: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
      // TODO: @ian use the VoyagePaymaster
      // TODO: @ian this is someone else's Paymaster and will **not** work for us
      [Contracts.Paymaster]: '0x37904A037A0a64bf8AB5c85b9db33e3AEa08fa68',
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
    case Network.Goerli:
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

export const getShortenedAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.slice(-4)}`;
};

export const getTxExpolerLink = (hash: string) => {
  const { explorer: explorerUrl } = getNetworkConfiguration();
  return `${explorerUrl}tx/${hash}`;
};
