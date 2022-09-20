import React, { useEffect } from 'react';
import { useNetwork } from 'wagmi';
import AppConnector from '@components/AppConnector';
import VoyagePaper from '@components/Card';
import styles from './index.module.scss';
import { App, getDappForTab } from '@utils/dapps';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { useAutoConnect } from '@utils/chain';
import { updateActiveTab } from '@state/modules/core';
import TitleWithLine from '@components/atoms/TitleWithLine';
import { Group } from '@mantine/core';
import { ReactComponent as LookrareIcon } from 'assets/img/looksrare-w-text.svg';
import { ReactComponent as OpenseaIcon } from 'assets/img/opensea-w-text.svg';
import Button from '@components/Button';
import CollectionCarousel from './carousel';

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
      <TitleWithLine size="md">Discover</TitleWithLine>
      <div className={styles.appConnector}>
        <AppConnector app={app} session={session} />
      </div>
      <Group spacing={11} my={16} noWrap>
        <VoyagePaper className={styles.marketplaceCard}>
          <OpenseaIcon className={styles.logo} />
          <Button className={styles.letsGoBtn}>LET'S GO!</Button>
        </VoyagePaper>
        <VoyagePaper className={styles.marketplaceCard}>
          <LookrareIcon className={styles.logo} />
          <Button className={styles.letsGoBtn}>LET'S GO!</Button>
        </VoyagePaper>
      </Group>
      <CollectionCarousel />
    </div>
  );
};

export default Home;
