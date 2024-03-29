import { MantineProvider } from '@mantine/core';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { Provider as StoreProvider } from 'react-redux';
import VoyageProvider from '@components/VoyageProvider';
import { MemoryRouter } from 'react-router-dom';
import './app.css';
import Router from './routes';
import { ExtensionConnector } from '@web3/connector';
import { chains as voyageChains } from '@utils/chain';
import { NotificationsProvider } from '@mantine/notifications';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { config } from '@utils/env';
import { apolloClient } from 'graphql/client';
import { ApolloProvider } from '@apollo/client';

function App({ store }: any) {
  const { provider: web3Provider, controller } = globalThis;
  const { chains, provider } = configureChains(voyageChains, [
    alchemyProvider({ apiKey: config.alchemyApiKey }),
  ]);
  const client = createClient({
    autoConnect: true,
    provider,
    connectors: [
      new ExtensionConnector({
        provider: web3Provider,
        chains,
        options: { shimDisconnect: true },
      }),
    ],
  });
  return (
    <StoreProvider store={store}>
      <WagmiConfig client={client}>
        <ApolloProvider client={apolloClient}>
          <VoyageProvider controller={controller}>
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={{
                colorScheme: 'dark',
                colors: {
                  brand: [
                    '#FFFBF8',
                    '#FFE2C9',
                    '#FFCA9E',
                    '#FFB578',
                    '#FFA254',
                    '#FF9034',
                    '#FF811D',
                    '#FF7000',
                    '#EC6500',
                    '#D45B00',
                  ],
                  'accent-green': [
                    '#7EFFEA',
                    '#5AFFE4',
                    '#3AFFDF',
                    '#1FFFD9',
                    '#0AFDD1',
                    '#08E7BE',
                    '#0CCDAA',
                    '#06BD9C',
                    '#02AE8F',
                    '#00A183',
                  ],
                  'accent-pink': [
                    '#FFE0EC',
                    '#FFB4D0',
                    '#FF8BB6',
                    '#FF669F',
                    '#FF498B',
                    '#FA307A',
                    '#F41B6A',
                    '#EE065A',
                    '#DC0050',
                    '#CA0047',
                  ],
                  'accent-blue': [
                    '#FEFEFF',
                    '#CEE5FF',
                    '#A3CEFF',
                    '#7CBAFF',
                    '#59A7FF',
                    '#3D96FF',
                    '#1884FF',
                    '#0075FF',
                    '#0069EC',
                    '#005FD5',
                  ],
                  gray: ['#6F7073', '#A4A5A8'],
                  white: ['#fff'],
                },
                primaryColor: 'brand',
                fontFamily: 'Titillium Web, sans-serif',
                fontSizes: {
                  sm: 11,
                  md: 14,
                  lg: 16,
                },
                headings: { fontFamily: 'Titillium Web, sans-serif' },
                other: {
                  gradients: {
                    brand: { from: '#ffa620', to: '#ef5b25', deg: 90 },
                  },
                },
              }}
            >
              <NotificationsProvider position="top-right">
                <MemoryRouter>
                  <Router />
                </MemoryRouter>
              </NotificationsProvider>
            </MantineProvider>
          </VoyageProvider>
        </ApolloProvider>
      </WagmiConfig>
    </StoreProvider>
  );
}

export default App;
