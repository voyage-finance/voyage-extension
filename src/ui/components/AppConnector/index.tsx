import Card from '@components/Card';
import cn from 'classnames';
import Button from '@components/Button';
import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { IWalletConnectSession } from '@walletconnect/types';
import { App } from '@utils/dapps';
import useVoyageController from '@hooks/useVoyageController';

interface Props {
  app?: App;
  session?: IWalletConnectSession;
  canDisconnect?: boolean;
}

const AppConnector = (props: Props) => {
  const { app, session, canDisconnect = false } = props;
  const shouldRenderDisconnect = canDisconnect && !!session;
  const controller = useVoyageController();
  const navigate = useNavigate();
  return (
    <Card className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.icon}>
          <img alt="todo" src={session?.peerMeta?.icons[0] ?? app?.icon} />
        </div>
        <div className={styles.info}>
          <div>
            <Text color="white" size="md" className={styles.name}>
              {session?.peerMeta?.name ?? app?.name}
            </Text>
          </div>
          <div className={styles.connectionInfo}>
            <div
              className={cn(
                styles.statusIndicator,
                !!session ? styles.ok : styles.bad
              )}
            />
            <div>
              <Text color="white" size="sm" className={styles.connectionStatus}>
                {session ? 'Connected' : 'Not connected'}
              </Text>
            </div>
          </div>
        </div>
        <div>
          {shouldRenderDisconnect ? (
            <Button
              className={styles.connectButton}
              component="button"
              onClick={() => controller.disconnectWC(session?.peerId)}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              className={styles.connectButton}
              component="button"
              onClick={() => navigate('/connect')}
              disabled={!!session}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppConnector;
