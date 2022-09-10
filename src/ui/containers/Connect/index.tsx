import React, { useState } from 'react';
import { Alert, Text, TextInput } from '@mantine/core';
import styles from './index.module.scss';
import { BrowserQRCodeReader } from '@zxing/browser';
import browser from 'webextension-polyfill';
import useVoyageController from '@hooks/useVoyageController';
import SettingsItem from '@components/SettingsItem';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { useNavigate } from 'react-router-dom';
import VoyagePaper from '@components/Card';
import Button from '@components/Button';
import { useForm } from '@mantine/form';
import { parseWalletConnectUri } from '@walletconnect/utils';

const Connect: React.FC = () => {
  const form = useForm({
    initialValues: { wcURI: '' },
    validate: {
      wcURI(value) {
        const res = parseWalletConnectUri(value);
        const isValid =
          res.key && res.bridge && res.handshakeTopic && res.version === 1;
        return isValid ? null : 'Invalid WC URI.';
      },
    },
  });
  const hasError = Object.keys(form.errors).length > 0;
  const [creatingSession, setCreatingSession] = useState(false);
  const handleConfirmURI = async () => {
    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      return;
    }
    const { wcURI } = form.values;
    await handleCreateSession(wcURI);
  };
  const [scanningQR, setScanningQR] = useState(false);
  const [qrError, setQrError] = useState<string>();
  const navigate = useNavigate();
  const voyageController = useVoyageController();
  const handleCreateSession = async (uri: string) => {
    try {
      setCreatingSession(true);
      const res = await voyageController.connectWithWC(uri);
      setTimeout(() => {
        navigate(`/approval/${res.id}`);
      }, 0);
    } catch {
      console.error('failed to initiate session request.');
    } finally {
      setCreatingSession(false);
    }
  };
  const scanForQR = async () => {
    try {
      if (qrError) setQrError(undefined);
      setScanningQR(true);
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
    } finally {
      setScanningQR(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.itemWrapper}>
        <SettingsItem
          iconLeft={<ChevronLeft />}
          handleClick={() => navigate(-1)}
        >
          <Text className={styles.copy} weight={700}>
            Back
          </Text>
        </SettingsItem>
      </div>
      <div className={styles.cardWrapper}>
        <VoyagePaper className={styles.card}>
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
          <Text className={styles.title} size="md" color="white">
            Option 1 <strong>| Scan WalletConnect QR code</strong>
          </Text>
          <Text className={styles.copy} size="sm" color="white">
            This option will automatically locate a WC QR on your screen. Please
            ensure the WC QR code is visible on your current tab before
            proceeding with this option.
          </Text>
          <Button
            className={styles.button}
            loading={scanningQR || creatingSession}
            loaderPosition="right"
            onClick={scanForQR}
          >
            {scanningQR ? 'Scanning' : 'Scan QR code'}
          </Button>
        </VoyagePaper>
      </div>
      <div className={styles.cardWrapper}>
        <VoyagePaper className={styles.card}>
          <Text className={styles.title} size="md" color="white">
            Option 2 <strong>| Enter WalletConnect URI</strong>
          </Text>
          <Text className={styles.copy} size="sm" color="white">
            Alternatively, you may manually enter the URI to connect to the game
            Marketplace.
          </Text>
          <div className={styles.inputWrapper}>
            <TextInput
              className={styles.input}
              placeholder="WC URI"
              {...form.getInputProps('wcURI')}
            />
          </div>
          <Button
            className={styles.button}
            loading={creatingSession}
            loaderPosition="right"
            onClick={handleConfirmURI}
            disabled={hasError}
          >
            Confirm
          </Button>
        </VoyagePaper>
      </div>
    </div>
  );
};

export default Connect;
