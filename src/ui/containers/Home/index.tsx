import React from 'react';
import { useNetwork } from 'wagmi';
import { Code, Text } from '@mantine/core';
import AppConnector from '@components/AppConnector';
import VoyagePaper from '@components/Card';
import styles from './index.module.scss';
import { SupportedApps } from '@utils/dapps';
import { useAppSelector } from '@hooks/useRedux';
import { chains, useAutoConnect } from '@utils/chain';
import { ReactComponent as ChevronRight } from '@images/chevron-right-gradient-icon.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { chain } = useNetwork();
  useAutoConnect();
  const chainId = chain?.id ?? 0;
  const isSupportedChain = chains.some(({ id }) => id === chainId);
  const navigate = useNavigate();
  const app = SupportedApps[chainId];
  const sessions = useAppSelector((state) => {
    return state.core.sessions;
  });
  const [session] = Object.keys(sessions)
    .map((id) => sessions[id])
    .filter(({ peerMeta }) => {
      return peerMeta?.url === app?.uri;
    });
  return (
    <div className={styles.root}>
      {isSupportedChain ? (
        <>
          <div className={styles.appConnector}>
            <AppConnector app={app} session={session} />
          </div>
          <VoyagePaper className={styles.main}>
            <div>
              <div>CrabaDAO Main Vault</div>
              <div>
                <Code>0xc494...5c43</Code>
              </div>
            </div>
          </VoyagePaper>
        </>
      ) : (
        <VoyagePaper className={styles.main}>
          <div className={styles.networkNotSupported}>
            <Text className={styles.title} size="md" color="white" weight={700}>
              Network not supported
            </Text>
            <Text className={styles.copy} size="sm" color="white">
              Voyage does not support any DApp on this network at the moment.
              Please change to a supported network to access your vaults.
            </Text>
            <Button
              sx={{ width: '215px' }}
              variant="outline"
              rightIcon={<ChevronRight />}
              onClick={() => navigate('/settings/network')}
            >
              Change Network
            </Button>
          </div>
        </VoyagePaper>
      )}
    </div>
  );
};

export default Home;
