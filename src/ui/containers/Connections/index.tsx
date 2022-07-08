import SettingsItem from '@components/SettingsItem';
import { Text } from '@mantine/core';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import styles from './index.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import AppConnector from '@components/AppConnector';
import { getDappForSession } from '@utils/dapps';

const Connections = () => {
  const navigate = useNavigate();
  const sessions = useAppSelector((state) => state.core.sessions);
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
      <div className={styles.divider}>
        <Text className={styles.copy} weight={700}>
          Active Wallet Connect Sessions
        </Text>
      </div>
      <div className={styles.connections}>
        {Object.keys(sessions).map((id) => {
          const session = sessions[id];
          const dapp = getDappForSession(session);
          return (
            <AppConnector app={dapp} key={id} session={session} canDisconnect />
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
