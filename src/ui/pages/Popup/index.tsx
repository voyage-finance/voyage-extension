import React from 'react';
import ReactDOM from 'react-dom';
import { createExternalExtensionProvider } from '@metamask/providers';
import './index.css';
import Popup from './Popup';

async function bootstrap() {
  const provider = createExternalExtensionProvider();
  ReactDOM.render(
    <React.StrictMode>
      <Popup provider={provider} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
