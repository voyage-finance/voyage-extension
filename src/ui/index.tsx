import React from 'react';
import ReactDOM from 'react-dom';
import { initWeb3 } from '@web3/init';
import { getStore } from '@state/store';
import App from './App';

async function bootstrap() {
  // set up a connection to background script
  initWeb3();
  const store = await getStore();
  ReactDOM.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
