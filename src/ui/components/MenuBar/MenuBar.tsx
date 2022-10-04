import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import { truncate } from '@utils/address';
import { chains } from '@utils/chain';
import cn from 'classnames';
import { useNetwork } from 'wagmi';
import browser from 'webextension-polyfill';
import JazzIcon from '../JazzIcon';
import styles from './index.module.scss';

const MenuBar = () => {
  const address = useAppSelector((state) => state.core.vaultAddress);
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);

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
          <div className={styles.jazzIcon}>
            <JazzIcon diameter={26} address={address} />
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
    </div>
  );
};

export default MenuBar;
