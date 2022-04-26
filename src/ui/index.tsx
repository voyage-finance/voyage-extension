import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { initWeb3 } from '@web3/init';

function bootstrap() {
  // set up a connection to background script
  initWeb3();
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
