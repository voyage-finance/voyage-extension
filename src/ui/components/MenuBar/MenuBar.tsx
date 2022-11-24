import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import { Drawer, Group, Image, Stack, Text } from '@mantine/core';
import { truncate } from '@utils/address';
import { chains } from '@utils/chain';
import cn from 'classnames';
import { useState } from 'react';
import { useNetwork } from 'wagmi';
import JazzIcon from '../JazzIcon';
import styles from './index.module.scss';
import { ReactComponent as ArrowRightGradient } from '@images/arrow-right-gradient.svg';
import { ReactComponent as ArrowRightSvg } from '@images/arrow-right.svg';
import { ReactComponent as CopyDefault } from 'assets/img/copy-gray.svg';
import { ReactComponent as CopyGradient } from 'assets/img/copy-gradient.svg';
import { ReactComponent as ScanDefault } from 'assets/img/scan-gray.svg';
import { ReactComponent as ScanGradient } from 'assets/img/scan-gradient.svg';
import PepePlacholderImg from '@images/pepe-placeholder.png';

const MenuBar = () => {
  const address = useAppSelector((state) => state.core.vaultAddress);
  const [profileOpened, setProfileOpened] = useState(true);
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);

  return (
    <div className={styles.root}>
      <div className={styles.voyageLogo}>
        <Voyage />
      </div>
      <div
        className={styles.accountInfo}
        onClick={() => setProfileOpened(true)}
      >
        <div className={styles.wrapper}>
          <div className={styles.jazzIcon}>
            <JazzIcon diameter={26} address={address} />
          </div>
          <div className={styles.connectionInfo}>
            <div className={styles.address}>{truncate(address)}</div>
            <div className={styles.network}>
              <div
                className={cn(
                  styles.status,
                  isSupportedChain ? styles.ok : styles.bad
                )}
              />
              <div className={styles.name}>
                {isSupportedChain ? chain?.name : 'Network Not Supported'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Drawer
        opened={profileOpened}
        onClose={() => setProfileOpened(false)}
        classNames={{
          drawer: styles.drawerRoot,
        }}
        withCloseButton={false}
        position="right"
      >
        <Stack>
          <div className={styles.profileHeader}>
            <Stack className={styles.connectionInfo} align="center" spacing={0}>
              <Text size="sm" color="gray">
                Network Connection
              </Text>
              <div className={styles.network}>
                <div
                  className={cn(
                    styles.status,
                    isSupportedChain ? styles.ok : styles.bad
                  )}
                />
                <div className={styles.name}>
                  {isSupportedChain ? chain?.name : 'Network Not Supported'}
                </div>
              </div>
            </Stack>
            <div
              className={styles.closeBtn}
              onClick={() => setProfileOpened(false)}
            >
              <ArrowRightSvg className={styles.arrowIconDefault} />
              <ArrowRightGradient className={styles.arrowIconGradient} />
            </div>
          </div>
          <Group spacing={11} align="start">
            <Stack align="end" spacing={0} sx={{ flex: 1 }}>
              <Text size="sm" color="gray">
                Address
              </Text>
              <Group spacing={1}>
                <div className={styles.address}>
                  <Text weight="bold">0x36eb...96c0x</Text>
                  <CopyDefault className={styles.copyIcon} />
                  <CopyGradient className={styles.copyIconGradient} />
                </div>
                <div className={styles.scanBtn}>
                  <ScanDefault className={styles.scanIcon} />
                  <ScanGradient className={styles.scanIconGradient} />
                </div>
              </Group>
            </Stack>
            <Image
              width={87}
              height={87}
              fit="contain"
              radius={10}
              src={PepePlacholderImg}
              alt="image"
            />
          </Group>
        </Stack>
      </Drawer>
    </div>
  );
};

export default MenuBar;
