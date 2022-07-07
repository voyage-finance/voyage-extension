import React from 'react';
import { Code } from '@mantine/core';
import styles from './index.module.scss';
import AppConnector from '@components/AppConnector';
import VoyagePaper from '@components/Card';

const Home: React.FC = () => {
  return (
    <div className={styles.root}>
      <div className={styles.appConnector}>
        <AppConnector />
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
