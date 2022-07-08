import { ChainID } from '@utils/chain';
import { IWalletConnectSession } from '@walletconnect/types';

export interface App {
  uri: string;
  name: string;
  icon: string;
}

export const SupportedApps: { [key: number]: App } = {
  [ChainID.Fuji]: {
    uri: 'https://example.walletconnect.org',
    name: 'Wallet Connect Example',
    icon: 'https://example.walletconnect.org/favicon.ico',
  },
};

export const getDappForSession = (session: IWalletConnectSession) => {
  const [res] = Object.keys(SupportedApps)
    .map((k) => SupportedApps[parseInt(k)])
    .filter((dapp) => {
      return dapp.name === session.peerMeta?.name;
    });
  return res;
};
