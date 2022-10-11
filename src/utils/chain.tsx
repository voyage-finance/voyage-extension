import { Chain, defaultChains, useConnect } from 'wagmi';
import { ReactComponent as Avax } from '@images/logo-avax.svg';
import { useEffect } from 'react';

export const chains: Chain[] = [...defaultChains];

export const networks = chains.map((chain) => ({
  ...chain,
  icon: <Avax />,
}));

export const useAutoConnect = () => {
  const { connect, connectors } = useConnect();
  useEffect(() => {
    const [defaultConnector] = connectors;
    connect({ connector: defaultConnector });
  }, []);
};
