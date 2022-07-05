import React, { useState } from 'react';
import { Alert, Button, TextInput } from '@mantine/core';
import styles from './index.module.scss';
import { connectWithWC } from '@state/modules/connect';
import { BrowserQRCodeReader } from '@zxing/browser';
import browser from 'webextension-polyfill';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import useVoyageController from '@hooks/useVoyageController';
import { PeerMeta } from '../../../controller';

interface Props {}

interface Approval {
  id: string;
  peerId: string;
  peerMeta: PeerMeta;
}

const Connect: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const [wcUri, setWcUri] = useState('');
  const [qrError, setQrError] = useState<string>();
  const sessions = useAppSelector((state) => {
    return state.core.sessions;
  });
  const [pendingSession, setPendingSession] = useState<Approval>();
  const voyageController = useVoyageController();
  const handleCreateSession = async (uri: string) => {
    const res = await voyageController.connectWithWC(uri);
    setPendingSession(res);
  };
  const handleApproveSession = async (id: string) => {
    await voyageController.approveApprovalRequest(id);
    console.log('[ui] approved');
    setPendingSession(undefined);
  };
  const handleRejectSession = async (id: string) => {
    await voyageController.rejectApprovalRequest(id);
    setPendingSession(undefined);
  };

  const scanForQR = async () => {
    try {
      if (qrError) setQrError(undefined);
      const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
        format: 'jpeg',
      });
      const reader = new BrowserQRCodeReader();
      const res = await reader.decodeFromImageUrl(dataUrl);
      console.log('wc uri: ', res.getText());
      await handleCreateSession(res.getText());
    } catch (e) {
      console.error('Failed to get a QR code: ', e);
      setQrError('Could not find a QR code');
    }
  };

  return (
    <div className={styles.root}>
      <div>Connect your Vault to games with WalletConnect.</div>
      {pendingSession ? (
        <div>
          {JSON.stringify(pendingSession, null, 4)}
          <Button onClick={() => handleApproveSession(pendingSession.id)}>
            Approve
          </Button>
          <Button onClick={() => handleRejectSession(pendingSession.id)}>
            Reject
          </Button>
        </div>
      ) : (
        <>
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
          {JSON.stringify(sessions, null, 4)}
        </>
      )}
    </div>
  );
};

export default Connect;
