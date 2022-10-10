import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { initWeb3 } from '@web3/init';
import { initStore } from '@state/store';
import App from './App';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
});

async function bootstrap() {
  // set up a connection to background script
  initWeb3();
  const store = await initStore();
  ReactDOM.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
