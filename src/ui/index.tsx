import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { initWeb3 } from '@web3/init';
import { initStore } from '@state/store';
import App from './App';
import { ExtensionEnvType, getEnvironmentType } from '@utils/extension';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  release: process.env.SENTRY_RELEASE,
});

async function bootstrap() {
  // set up a connection to background script
  initWeb3();
  const store = await initStore();
  const isResetFlow = getEnvironmentType() === ExtensionEnvType.Reset;
  if (isResetFlow) {
    controller.cancelLogin();
    window.open('/home.html', '_self');
  }
  ReactDOM.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

bootstrap();
