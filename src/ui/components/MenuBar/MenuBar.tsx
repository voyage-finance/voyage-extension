import { PropsWithChildren } from 'react';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import { ReactComponent as MM } from '@images/logo-metamask.svg';
import { truncate } from '@utils/address';
import styles from './index.module.scss';
import { useAccount, useNetwork } from 'wagmi';
import { chains, switchAccounts } from '@utils/chain';
import cn from 'classnames';
import { ActionIcon, Menu } from '@mantine/core';
import { DotsVertical } from 'tabler-icons-react';

interface Props {}

const MenuBar = (props: PropsWithChildren<Props>) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);

  return (
    <div className={styles.root}>
      <div className={styles.voyageLogo}>
        <Voyage />
      </div>
      <div className={styles.accountInfo}>
        <div className={styles.wrapper}>
          <div className={styles.mmLogo}>
            <MM />
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
      <div className={styles.connectionOptions}>
        <Menu
          control={
            <ActionIcon variant="transparent">
              <DotsVertical color="#9e9e9e" />
            </ActionIcon>
          }
        >
          <Menu.Item onClick={switchAccounts}>Switch Account</Menu.Item>
        </Menu>
      </div>
    </div>
  );
};

export default MenuBar;
