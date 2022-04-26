import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Provider as WagmiProvider } from 'wagmi';
import { Provider as StoreProvider } from 'react-redux';
import { ExtensionConnector } from '@web3/connector';
import VoyageProvider from '@components/VoyageProvider';
import { store } from '@state/store';
import { MemoryRouter } from 'react-router-dom';
import Router from './routes';

function App() {
  const { provider, controller } = globalThis;
  return (
    <StoreProvider store={store}>
      <WagmiProvider
        autoConnect
        connectors={[new ExtensionConnector({ provider })]}
      >
        <VoyageProvider controller={controller}>
          <MantineProvider withGlobalStyles withNormalizeCSS>
            <MemoryRouter>
              <Router />
            </MemoryRouter>
          </MantineProvider>
        </VoyageProvider>
      </WagmiProvider>
    </StoreProvider>
  );
}

export default App;
