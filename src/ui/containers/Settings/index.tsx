import SettingsItem from '@components/SettingsItem';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { ReactComponent as ChevronRight } from '@images/chevron-right-icon.svg';
import { ReactComponent as Share } from '@images/share-icon.svg';
import { Text } from '@mantine/core';
import { ReactComponent as Power } from '@images/power-icon.svg';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import useVoyageController from '@hooks/useVoyageController';

const Settings = () => {
  const controller = useVoyageController();
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    await controller.cancelLogin();
    window.close();
  };

  return (
    <div className={styles.root}>
      <div className={styles.items}>
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
