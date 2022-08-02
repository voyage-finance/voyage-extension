import { Chain, defaultChains } from 'wagmi';
import { ReactComponent as Avax } from '@images/logo-avax.svg';

export enum ChainID {
  Mainnet = 1,
  Goerli = 5,
}

export const chains: Chain[] = [...defaultChains];

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
