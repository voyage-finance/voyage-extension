import SettingsItem from '@components/SettingsItem';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { ReactComponent as ChevronRight } from '@images/chevron-right-icon.svg';
import { ReactComponent as Share } from '@images/share-icon.svg';
import { Text } from '@mantine/core';
import { ReactComponent as Power } from '@images/power-icon.svg';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import useVoyageController from '@hooks/useVoyageController';
import { useAppSelector } from '@hooks/useRedux';
import browser from 'webextension-polyfill';
import { Copy } from 'tabler-icons-react';
import { getChainID } from '@utils/env';
import { ChainID } from '@utils/constants';
import TitleWithLine from '@components/atoms/TitleWithLine';

const Settings = () => {
  const controller = useVoyageController();
  const navigate = useNavigate();

  const privateKey = useAppSelector(
    (state) => state.core.account?.keyPair?.privateKey
  );
  const chainID = getChainID();

  const handleDisconnect = async () => {
    await controller.cancelLogin();
    window.close();
  };

  const onCopyHandler = async () => {
    if (privateKey) {
      await navigator.clipboard.writeText(privateKey);
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Address copied',
        message: 'Address was copied to your clipboard',
      });
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.items}>
        <TitleWithLine>Settings</TitleWithLine>
        <SettingsItem
          iconLeft={<ChevronLeft />}
          handleClick={() => navigate(-1)}
        >
          <Text className={styles.copy} weight={700}>
            Back
          </Text>
        </SettingsItem>
        <SettingsItem
          iconLeft={<Share />}
          handleClick={() => navigate('/connections')}
          iconRight={<ChevronRight />}
        >
          <Text className={styles.copy} weight={700}>
            Manage WalletConnect Sessions
          </Text>
        </SettingsItem>
        {(chainID == ChainID.Goerli || chainID == ChainID.Localhost) && (
          <SettingsItem iconLeft={<Copy />} handleClick={onCopyHandler}>
            <Text className={styles.copy} weight={700}>
              Copy private key
            </Text>
          </SettingsItem>
        )}
        <SettingsItem iconLeft={<Power />} handleClick={handleDisconnect}>
          <Text className={styles.copy} weight={700}>
            Logout
          </Text>
        </SettingsItem>
      </div>
    </div>
  );
};

export default Settings;
