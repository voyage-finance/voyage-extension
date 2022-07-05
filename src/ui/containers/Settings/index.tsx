import SettingsItem from '@components/SettingsItem';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { ReactComponent as ChevronRight } from '@images/chevron-right-icon.svg';
import { ReactComponent as ArrowUpRight } from '@images/arrow-up-right-icon.svg';
import { ReactComponent as Share } from '@images/share-icon.svg';
import { ReactComponent as Network } from '@images/network-icon.svg';
import { ReactComponent as Wallet } from '@images/wallet-icon.svg';
import { ReactComponent as Power } from '@images/power-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Text } from '@mantine/core';
import styles from './index.module.scss';
import { switchAccounts } from '@utils/chain';
import { useDisconnect } from 'wagmi';

const Settings = () => {
  const navigate = useNavigate();
  const { disconnectAsync: disconnect } = useDisconnect();
  const handleDisconnect = async () => {
    await disconnect();
    navigate('/', { replace: true });
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
          iconLeft={<Network />}
          handleClick={() => navigate('/settings/network')}
          iconRight={<ChevronRight />}
        >
          <Text className={styles.copy} weight={700}>
            Switch Network
          </Text>
        </SettingsItem>
        <SettingsItem
          iconLeft={<Wallet />}
          iconRight={<ArrowUpRight />}
          handleClick={switchAccounts}
        >
          <Text className={styles.copy} weight={700}>
            Change Wallet
          </Text>
        </SettingsItem>
        <SettingsItem
          iconLeft={<Share />}
          // TODO
          handleClick={() => null}
          iconRight={<ChevronRight />}
        >
          <Text className={styles.copy} weight={700}>
            Manage WalletConnect Sessions
          </Text>
        </SettingsItem>
        <SettingsItem iconLeft={<Power />} handleClick={handleDisconnect}>
          <Text className={styles.copy} weight={700}>
            Disconnect Extension
          </Text>
        </SettingsItem>
      </div>
    </div>
  );
};

export default Settings;
