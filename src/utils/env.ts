import { alchemyProvider } from 'wagmi/providers/alchemy';

export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
}

export const getNetworkEnvironment = () => {
  const env = (process.env.NETWORK_ENV as Network) || Network.Goerli;
  console.log('network env: ', process.env.NEXT_PUBLIC_VYG_ENV);
  return env;
};

export const getAlchemyApiKey = () => {
  switch (getNetworkEnvironment()) {
    case Network.Goerli:
      return process.env.GOERLI_API_KEY;
    case Network.Mainnet:
      return process.env.MAINNET_API_KEY;
  }
};
export const getAlchemyProvider = () =>
  alchemyProvider({ apiKey: getAlchemyApiKey() });
