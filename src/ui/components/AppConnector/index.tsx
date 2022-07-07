import Card from '@components/Card';
import cn from 'classnames';
import { useNetwork } from 'wagmi';
import { ReactElement } from 'react';
import { useAppSelector } from '@hooks/useRedux';
import Button from '@components/Button';
import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

interface App {
  uri: string;
  name: string;
  icon: ReactElement;
}

const Chains = {
  fuji: {
    chainId: 43113,
  },
};

const SupportedApps: { [key: number]: App } = {
  [Chains.fuji.chainId]: {
    uri: 'https://example.walletconnect.org',
    name: 'Wallet Connect Example',
    icon: (
      <img alt="todo" src="https://example.walletconnect.org/favicon.ico" />
    ),
  },
};

const AppConnector = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id ?? 0;
  const app = SupportedApps[chainId];
  const sessions = useAppSelector((state) => {
    return state.core.sessions;
  });
  const navigate = useNavigate();
  const [connected] = Object.keys(sessions)
    .map((id) => sessions[id])
    .filter(({ peerMeta }) => {
      return peerMeta?.url === app?.uri;
    });
  return (
    <Card className={styles.root}>
      {chainId === 0 ? (
        'loading'
      ) : (
        <div className={styles.inner}>
          <div className={styles.icon}>{app?.icon}</div>
          <div className={styles.info}>
            <div>
              <Text color="white" size="md" className={styles.name}>
                {app?.name}
              </Text>
            </div>
            <div className={styles.connectionInfo}>
              <div
                className={cn(
                  styles.statusIndicator,
                  !!connected ? styles.ok : styles.bad
                )}
              />
              <div>
                <Text
                  color="white"
                  size="sm"
                  className={styles.connectionStatus}
                >
                  {connected ? 'Connected' : 'Not connected'}
                </Text>
              </div>
            </div>
          </div>
          <div>
            <Button
              className={styles.connectButton}
              component="button"
              onClick={() => navigate('/connect')}
              disabled={!!connected}
            >
              Connect
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AppConnector;
