import { ethers } from 'ethers';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { getChainID } from './config';
import {
  ChainID,
  LOOKS_ADDRESS,
  PAYMASTER_ADDRESS,
  VOYAGE_ADDRESS,
} from './constants';
import { CROSS_CHAIN_SEAPORT_ADDRESS } from '@opensea/seaport-js/lib/constants';

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

const VOYAGE = VOYAGE_ADDRESS[getChainID()];
const LOOKS = LOOKS_ADDRESS[getChainID()];
const PAYMASTER = PAYMASTER_ADDRESS[getChainID()];
const contracts = {
  [Contracts.Voyage]: VOYAGE,
  [Contracts.LooksRare]: LOOKS,
  [Contracts.Seaport]: CROSS_CHAIN_SEAPORT_ADDRESS,
  [Contracts.Paymaster]: PAYMASTER,
};
const addressToContract = Object.keys(contracts).reduce((acc, key: string) => {
  const address = contracts[key as Contracts];
  return { ...acc, [address]: key };
}, {});

export const NetworkConfigurationMap: Record<Network, NetworkConfiguration> = {
  [Network.Goerli]: {
    name: Network.Goerli,
    apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
    explorer: 'https://goerli.etherscan.io/',
    endpoint: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    chaindId: ChainID.Goerli,
    contracts,
    addressToContract,
  },
  [Network.Localhost]: {
    name: Network.Localhost,
    apiKey: process.env.ALCHEMY_RINKEBY_API_KEY,
    endpoint: `http://localhost:8545`,
    explorer: 'https://goerli.etherscan.io/',
    chaindId: ChainID.Goerli,
    contracts,
    addressToContract,
  },
  [Network.Mainnet]: {
    name: Network.Mainnet,
    apiKey: process.env.MAINNET_API_KEY,
    endpoint: `https://eth-mainnet.g.alchemy.com/v2/_ugyedYRT9AOVAGTuXNVKSgFuauulnkC`,
    explorer: 'https://etherscan.io/',
    chaindId: ChainID.Mainnet,
    contracts,
    addressToContract,
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
