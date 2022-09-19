import React, { useEffect } from 'react';
import { useNetwork } from 'wagmi';
import { Code } from '@mantine/core';
import AppConnector from '@components/AppConnector';
import VoyagePaper from '@components/Card';
import styles from './index.module.scss';
import { App, getDappForTab } from '@utils/dapps';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { useAutoConnect } from '@utils/chain';
import { updateActiveTab } from '@state/modules/core';
import Link from '@components/Link';
import { getShortenedAddress, getTxExpolerLink } from '@utils/env';

const Home: React.FC = () => {
  const { chain } = useNetwork();
  const dispatch = useAppDispatch();
  useAutoConnect();
  const chainId = chain?.id ?? 0;
  const activeTab = useAppSelector((state) => {
    return state.core.activeTab;
  });
  const sessions = useAppSelector((state) => {
    return state.core.sessions;
  });

  const [session] = Object.keys(sessions)
    .map((id) => sessions[id])
    .filter(({ peerMeta }) => {
      return peerMeta
        ? new URL(peerMeta.url).origin === activeTab?.origin
        : false;
    });
  const app: App | undefined =
    session && session.peerMeta
      ? {
          uri: session.peerMeta.url,
          name:
            getDappForTab(chainId, activeTab)?.name || session.peerMeta.name,
          icon: session.peerMeta.icons[0],
        }
      : getDappForTab(chainId, activeTab);

  useEffect(() => {
    const fetchCurrentTab = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      console.log('---- Current Tab ----', tab, session);
      if (tab.url) {
        const url = new URL(tab.url);
        dispatch(
          updateActiveTab({
            origin: url.origin,
            url: tab.url,
          })
        );
      }
    };
    fetchCurrentTab();
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.appConnector}>
        <AppConnector app={app} session={session} />
      </div>
      <VoyagePaper className={styles.main}>
        <div>
          <div>Main Page</div>
        </div>
      </VoyagePaper>
    </div>
  );
};

export default Home;
