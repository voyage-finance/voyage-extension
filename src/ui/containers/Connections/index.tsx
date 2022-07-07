import SettingsItem from '@components/SettingsItem';
import { Text } from '@mantine/core';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import styles from './index.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';

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
    </div>
  );
};

export default Connections;
