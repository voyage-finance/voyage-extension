import React from 'react';
import { MantineProvider } from '@mantine/core';
import Connect from '../../containers/Connect';

function Popup() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Connect />
    </MantineProvider>
  );
}

export default Popup;
