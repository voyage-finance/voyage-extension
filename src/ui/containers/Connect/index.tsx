import React, { useState } from 'react';
import { Button, TextInput } from '@mantine/core';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import styles from './index.module.scss';
// import useVoyageController from '../../hooks/useVoyageController';
import { connectWithWC } from '@state/modules/connect';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { BrowserQRCodeReader } from '@zxing/browser';
import browser from 'webextension-polyfill';

interface Props {}

const Connect: React.FC<Props> = () => {
  // const controller = useVoyageController();
  // // useEffect(() => {
  // //   (async () => {
  // //     const res = await controller.connectWithWC();
  // //     console.log('controller response: ', res);
  // //   })();
  // // }, []);
  const [{ data, error, loading }, connect] = useConnect();
  const [{ data: account }, disconnect] = useAccount();
  const [{ data: signature, loading: signingMessage }, signMessage] =
    useSignMessage();
  if (error) {
    console.error('error connecting: ', error);
  }
  const dispatch = useAppDispatch();
  const [wcUri, setWcUri] = useState('');
  const { connected, session } = useAppSelector((state) => {
    return state.wc;
  });

  const scanForQR = async () => {
    try {
      const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
        format: 'jpeg',
      });
      const reader = new BrowserQRCodeReader();
      const res = await reader.decodeFromImageUrl(dataUrl);
      console.log('got WC uri: ', res.getText());
      dispatch(connectWithWC(res.getText()));
    } catch (e) {
      console.error('failed to get a QR code: ', e);
    }
  };

  console.log('signature: ', signature);
  return (
    <div className={styles.root}>
      {data.connected && (
        <p className={styles.address}>
          Yay you are connected: {account?.address}
        </p>
      )}
      <Button
        onClick={() =>
          data.connected ? disconnect() : connect(data.connectors[0])
        }
      >
        {data.connected ? 'Disconnect MetaMask' : 'Connect to metamask'}
      </Button>

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

      <Button
        disabled={!data.connected || signingMessage || loading}
        onClick={() =>
          signMessage({ message: "i'm a little teapot short and stout!" })
        }
      >
        Sign something
      </Button>
      {signature && <p>Got a signature: {signature}</p>}
    </div>
  );
};

export default Connect;
