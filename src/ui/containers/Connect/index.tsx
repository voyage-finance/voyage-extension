import React, { useState } from 'react';
import { Alert, Button, TextInput } from '@mantine/core';
import styles from './index.module.scss';
import { connectWithWC } from '@state/modules/connect';
import { BrowserQRCodeReader } from '@zxing/browser';
import browser from 'webextension-polyfill';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';

interface Props {}

const Connect: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const [wcUri, setWcUri] = useState('');
  const [qrError, setQrError] = useState<string>();
  const { connected, session } = useAppSelector((state) => {
    return state.wc;
  });

  const scanForQR = async () => {
    try {
      if (qrError) setQrError(undefined);
      const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
        format: 'jpeg',
      });
      const reader = new BrowserQRCodeReader();
      const res = await reader.decodeFromImageUrl(dataUrl);
      dispatch(connectWithWC(res.getText()));
    } catch (e) {
      console.error('Failed to get a QR code: ', e);
      setQrError('Could not find a QR code');
    }
  };

  return (
    <div className={styles.root}>
      <div>Connect your Vault to games with WalletConnect.</div>
      {/* TODO: get the actual vault address from store */}
      <div>Vault address: 0x12345</div>
      <div>Network: Avalanche-C</div>
      {qrError && (
        <Alert
          title={qrError}
          withCloseButton
          color="red"
          onClose={() => setQrError(undefined)}
        >
          We didn't find a QR code on the page. Try again or enter the URI
          manually.
        </Alert>
      )}
      <TextInput
        placeholder="WC URI"
        value={wcUri}
        onChange={(evt) => setWcUri(evt.currentTarget.value)}
      />
      <Button onClick={() => dispatch(connectWithWC(wcUri))}>
        Connect with WC
      </Button>
      <Button onClick={scanForQR}>Scan WC QR code</Button>
      {connected ? (
        <pre>
          {`Peer ID: ${session?.peerId}`}
          {JSON.stringify(session)}
        </pre>
      ) : null}
    </div>
  );
};

export default Connect;
