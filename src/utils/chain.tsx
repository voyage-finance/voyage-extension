import { Chain } from 'wagmi';
import { ReactComponent as Avax } from '@images/logo-avax.svg';

export enum ChainID {
  Fuji = 43_113,
  Avalanche = 43_114,
}

export const chains: Chain[] = [
  {
    id: ChainID.Fuji,
    name: 'Avalanche FUJI C-Chain',
    network: 'avalanche',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax-test.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: {
        name: 'Snowtrace',
        url: 'https://testnet.snowtrace.io/',
      },
    },
    testnet: true,
  },
  {
    id: ChainID.Avalanche,
    name: 'Avalanche Network',
    network: 'avalanche',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: {
        name: 'Snowtrace',
        url: 'https://snowtrace.io/',
      },
    },
  },
];

export const switchAccounts = async () => {
  await globalThis.provider.request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  });
};

export const networks = chains.map((chain) => ({
  ...chain,
  icon: <Avax />,
}));
