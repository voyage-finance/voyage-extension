import SettingsItem from '@containers/Settings/SettingsItem';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { ReactComponent as ChevronRight } from '@images/chevron-right-icon.svg';
import { ReactComponent as ArrowUpRight } from '@images/arrow-up-right-icon.svg';
import { ReactComponent as Share } from '@images/share-icon.svg';
import { ReactComponent as Network } from '@images/network-icon.svg';
import { ReactComponent as Wallet } from '@images/wallet-icon.svg';
import { ReactComponent as Power } from '@images/power-icon.svg';
import { useNavigate } from 'react-router-dom';
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
          title="Back"
          iconLeft={ChevronLeft}
          handleClick={() => navigate(-1)}
        />
        <SettingsItem
          title="Switch Network"
          iconLeft={Network}
          // TODO
          handleClick={() => null}
          iconRight={ChevronRight}
        />
        <SettingsItem
          title="Change Wallet"
          iconLeft={Wallet}
          iconRight={ArrowUpRight}
          handleClick={switchAccounts}
        />
        <SettingsItem
          title="Manage WalletConnect Sessions"
          iconLeft={Share}
          // TODO
          handleClick={() => null}
          iconRight={ChevronRight}
        />
        <SettingsItem
          title="Disconnect Extension"
          iconLeft={Power}
          handleClick={handleDisconnect}
        />
      </div>
    </div>
  );
};

export default Settings;
