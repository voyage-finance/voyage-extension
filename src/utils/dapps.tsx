import { TabInfo } from '@state/modules/core';
import { ChainID } from '@utils/chain';
import { IWalletConnectSession } from '@walletconnect/types';

export interface App {
  uri: string;
  name: string;
  icon: string;
}

export const SupportedApps: { [key: number]: { [origin: string]: App } } = {
  [ChainID.Goerli]: {
    'https://example.walletconnect.org': {
      uri: 'https://example.walletconnect.org',
      name: 'Wallet Connect Example',
      icon: 'https://example.walletconnect.org/favicon.ico',
    },
    'https://testnets.opensea.io': {
      uri: 'https://testnets.opensea.io',
      name: 'OpenSea',
      icon: 'https://testnets.opensea.io/static/images/favicon/32x32.png',
    },
  },
  [ChainID.Rinkeby]: {
    'https://example.walletconnect.org': {
      uri: 'https://example.walletconnect.org',
      name: 'Wallet Connect Example',
      icon: 'https://example.walletconnect.org/favicon.ico',
    },
    'https://testnets.opensea.io': {
      uri: 'https://testnets.opensea.io',
      name: 'OpenSea',
      icon: 'https://testnets.opensea.io/static/images/favicon/32x32.png',
    },
  },
};

export const getDappForSession = (session: IWalletConnectSession) => {
  const origin = session.peerMeta
    ? new URL(session.peerMeta.url).origin
    : undefined;
  return origin ? SupportedApps[session.chainId][origin] : undefined;
};

export const getDappForTab = (chainId: number, tab?: TabInfo) => {
  if (tab && chainId) {
    return SupportedApps[chainId][tab.origin];
  }
};
