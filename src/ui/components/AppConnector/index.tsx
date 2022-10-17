import Card from '@components/Card';
import cn from 'classnames';
import Button from '@components/Button';
import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { IWalletConnectSession } from '@walletconnect/types';
import { App } from '@utils/dapps';
import useVoyageController from '@hooks/useVoyageController';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import { ReactComponent as WCLogo } from '@images/wc.svg';

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
          <img
            alt="todo"
            src={session?.peerMeta?.icons[0] ?? app?.icon ?? PepePlacholderImg}
          />
        </div>
        <div className={styles.info}>
          <div>
            <Text color="white" size="md" className={styles.name}>
              {app?.name ?? session?.peerMeta?.name ?? 'Unrecognized App'}
            </Text>
          </div>
          <div className={styles.connectionInfo}>
            <div
              className={cn(
                styles.statusIndicator,
                //eslint-disable-next-line
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
              <div className={styles.btnContent}>
                {session ? `Connected` : `Connect`}
                <span className={styles.via}> via </span>WC
                {!session && <WCLogo style={{ marginLeft: 4 }} />}
              </div>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppConnector;
