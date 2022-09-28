import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import { ReactComponent as MM } from '@images/logo-metamask.svg';
import { truncate } from '@utils/address';
import styles from './index.module.scss';
import { useNetwork } from 'wagmi';
import { chains } from '@utils/chain';
import cn from 'classnames';
import { ActionIcon } from '@mantine/core';
import { DotsVertical } from 'tabler-icons-react';
import { useNavigate } from 'react-router-dom';
import browser from 'webextension-polyfill';
import { useAppSelector } from '@hooks/useRedux';

const MenuBar = () => {
  const address = useAppSelector((state) => state.core.vaultAddress);
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);
  const navigate = useNavigate();

  const onClickHandler = async () => {
    await navigator.clipboard.writeText(address ?? '');
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Address copied',
      message: 'Address was copied to your clipboard',
    });
  };

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
          <div className={styles.connectionInfo} onClick={onClickHandler}>
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
        <ActionIcon variant="transparent" onClick={() => navigate('/settings')}>
          <DotsVertical color="#9e9e9e" />
        </ActionIcon>
      </div>
    </div>
  );
};

export default MenuBar;
