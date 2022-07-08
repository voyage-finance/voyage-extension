import React from 'react';
import { useNetwork } from 'wagmi';
import { Code } from '@mantine/core';
import AppConnector from '@components/AppConnector';
import VoyagePaper from '@components/Card';
import styles from './index.module.scss';
import { SupportedApps } from '@utils/dapps';
import { useAppSelector } from '@hooks/useRedux';

const Home: React.FC = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id ?? 0;
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
    </div>
  );
};

export default Home;
