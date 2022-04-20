import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Provider as WagmiProvider } from 'wagmi';
import { Provider as StoreProvider } from 'react-redux';

import Connect from '@containers/Connect';
import { ExtensionConnector } from '@web3/connector';
import VoyageProvider from '@components/VoyageProvider';
import { store } from '@state/store';

function Popup() {
  const { provider, controller } = globalThis;
  return (
    <StoreProvider store={store}>
      <WagmiProvider
        autoConnect
        connectors={[new ExtensionConnector({ provider })]}
      >
        <VoyageProvider controller={controller}>
          <MantineProvider withGlobalStyles withNormalizeCSS>
            <Connect />
          </MantineProvider>
        </VoyageProvider>
      </WagmiProvider>
    </StoreProvider>
  );
}

export default Popup;
