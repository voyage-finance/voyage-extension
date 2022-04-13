import React from 'react';
import { MantineProvider } from '@mantine/core';
import { BaseProvider } from "@metamask/providers";
import { Provider as WagmiProvider } from 'wagmi';
import Connect from '../../containers/Connect';
import { ExtensionConnector } from "../../web3/connector";

interface Props {
  provider: BaseProvider;
}

function Popup({ provider }: Props) {
  return (
    <WagmiProvider autoConnect connectors={[new ExtensionConnector({ provider })]}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Connect />
      </MantineProvider>
    </WagmiProvider>
  );
}

export default Popup;
