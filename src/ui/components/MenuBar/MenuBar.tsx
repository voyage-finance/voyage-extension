import CopyTooltip from '@components/atoms/CopyTooltip';
import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import { truncate } from '@utils/address';
import { chains } from '@utils/chain';
import cn from 'classnames';
import { useState } from 'react';
import { useNetwork } from 'wagmi';
import JazzIcon from '../JazzIcon';
import styles from './index.module.scss';

const MenuBar = () => {
  const address = useAppSelector((state) => state.core.vaultAddress);
  const [copied, setCopied] = useState(false);
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);

  const onClickHandler = async () => {
    await navigator.clipboard.writeText(address ?? '');
    setCopied(true);
  };

  return (
    <div className={styles.root}>
      <div className={styles.voyageLogo}>
        <Voyage />
      </div>
      <CopyTooltip copied={copied}>
        <div
          className={styles.accountInfo}
          onClick={onClickHandler}
          onMouseLeave={() => setCopied(false)}
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
      </CopyTooltip>
    </div>
  );
};

export default MenuBar;
