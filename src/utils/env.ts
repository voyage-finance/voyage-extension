import { CROSS_CHAIN_SEAPORT_ADDRESS } from '@opensea/seaport-js/lib/constants';
import { TORUS_NETWORK, TORUS_NETWORK_TYPE } from '@toruslabs/customauth';
import {
  ChainID,
  LOOKS_ADDRESS,
  PAYMASTER_ADDRESS,
  VoyageContract,
  VOYAGE_ADDRESS,
} from './constants';

type AddressToContract = Record<string, VoyageContract>;

export const getChainID = () => {
  const configuredChainID = process.env.CHAIN_ID || '5';
  return parseInt(configuredChainID, 10) as ChainID;
};

const CHAIN_ID = getChainID();
const VOYAGE = VOYAGE_ADDRESS[CHAIN_ID];
const LOOKS = LOOKS_ADDRESS[CHAIN_ID];
const PAYMASTER = PAYMASTER_ADDRESS[CHAIN_ID];

export const contractToAddress = {
  [VoyageContract.Voyage]: VOYAGE.toLowerCase(),
  [VoyageContract.LooksRare]: LOOKS.toLowerCase(),
  [VoyageContract.Seaport]: CROSS_CHAIN_SEAPORT_ADDRESS.toLowerCase(),
  [VoyageContract.Paymaster]: PAYMASTER.toLowerCase(),
};
const addressToContract = Object.keys(contractToAddress).reduce(
  (acc: AddressToContract, key: string) => {
    const address = contractToAddress[key as VoyageContract];
    return { ...acc, [address]: key } as AddressToContract;
  },
  {}
);

interface VoyageExtensionConfig {
  debug: boolean;
  chainId: ChainID;
  alchemyRpcUrl: string;
  alchemyApiKey: string;
  explorerUrl: string;
  voyageApiUrl: string;
  voyageGraphQLUrl: string;
  voyageWebUrl: string;
  torusNetwork: TORUS_NETWORK_TYPE;
  torusVerifier: string;
  numConfirmations: number;
  paymaster: string;
  voyage: string;
}

export const resolveConfiguration = (): VoyageExtensionConfig => {
  const chainId = parseInt(process.env.CHAIN_ID ?? '5', 10);
  return {
    chainId,
    debug: process.env.VOYAGE_ENV === 'true',
    alchemyRpcUrl:
      process.env.ALCHEMY_RPC_URL ??
      'https://eth-goerli.g.alchemy.com/v2/IG5Is2xWE1WkB-h0cN1NX58xw_74WEZj',
    alchemyApiKey:
      process.env.ALCHEMY_API_KEY ?? 'IG5Is2xWE1WkB-h0cN1NX58xw_74WEZj',
    voyageApiUrl:
      process.env.VOYAGE_API_URL ?? 'https://api.staging.voyage.finance',
    voyageGraphQLUrl:
      process.env.VOYAGE_GRAPHQL_URL ??
      'https://api.thegraph.com/subgraphs/name/voyage-finance/protocol-v1-goerli',
    voyageWebUrl:
      process.env.VOYAGE_WEB_URL ?? 'https://app.staging.voyage.finance',
    explorerUrl: process.env.EXPLORER_URL ?? 'https://goerli.etherscan.io',
    torusNetwork: (process.env.TORUS_NETWORK ??
      TORUS_NETWORK.TESTNET) as TORUS_NETWORK_TYPE,
    torusVerifier: process.env.TORUS_VERIFIER ?? 'voyage-finance',
    numConfirmations: parseInt(process.env.NUM_CONFIRMATIONS ?? '2', 10),
    paymaster: PAYMASTER.toLowerCase(),
    voyage: VOYAGE.toLowerCase(),
  };
};

export const config = resolveConfiguration();

export const getContractByAddress = (address: string): VoyageContract =>
  addressToContract[address];

export const getMarketplaceNameByAddress = (address?: string): string => {
  if (!address) return '';
  switch (getContractByAddress(address)) {
    case VoyageContract.LooksRare:
      return 'LooksRare';
    case VoyageContract.Seaport:
      return 'OpenSea';
    default:
      return '';
  }
};

export const getShortenedAddress = (address = '') => {
  return `${address.substring(0, 6)}...${address.slice(-4)}`;
};

export const getTxExplorerLink = (hash: string) => {
  return `${config.explorerUrl}/tx/${hash}`;
};
