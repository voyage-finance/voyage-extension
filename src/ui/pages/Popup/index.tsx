import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Popup from './Popup';
import PortStream from 'extension-port-stream';
import browser from 'webextension-polyfill';
import { BaseProvider } from '@metamask/providers';
import { Duplex } from 'stream';

async function bootstrap() {
  // set up a connection to background script
  const port = browser.runtime.connect({ name: 'voyage-popup' });
  const providerStream = new PortStream(port) as unknown as Duplex;
  const provider = new BaseProvider(providerStream);
  ReactDOM.render(
    <React.StrictMode>
      <Popup provider={provider} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
