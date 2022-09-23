import * as React from 'react';
import Card from '@components/Card';
import styles from './index.module.scss';
import { Group, Stack } from '@mantine/core';
import Text from '@components/Text';
import { ReactComponent as WethSvg } from '@images/weth.svg';
import { ReactComponent as RecycleArrowsSvg } from '@images/recycle-arrows.svg';
import { ReactComponent as ArrowUpRightSvg } from '@images/arrow-up-right-icon.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { useEthBalance } from '@hooks/useEthBalance';
import { useAppSelector } from '@hooks/useRedux';
import { ETHERS_DECIMALS, formatAmount, Zero } from '@utils/bn';
import { useWEthBalance } from '@hooks/useWEthBalance';
import cn from 'classnames';
import showNotification from '@utils/notification';
import { ethers } from 'ethers';
import { getTxExpolerLink } from '@utils/env';

const TopUpCard: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [ethBalance] = useEthBalance(vaultAddress, true);
  const [prevEthBalance, setPrevEthBalance] = React.useState(Zero);
  const [wethBalance] = useWEthBalance(vaultAddress!, true);

  const [isWrapping, setIsWrapping] = React.useState(false);
  const [lastWrappedHash, setLastWrappedHash] = React.useState('');

  const onWrapClick = async () => {
    if (isWrapping) return;
    if (lastWrappedHash)
      window.open(getTxExpolerLink(lastWrappedHash), '_blank');
    setIsWrapping(true);
    try {
      const tx = await controller.wrapVaultETH(
        ethBalance.shiftedBy(ETHERS_DECIMALS)
      );
      showNotification({
        title: 'Started wrapping eth',
        message: '',
        hash: tx.hash,
        type: 'success',
      });
      // tx.wait is underfined, so using this
      await new ethers.providers.Web3Provider(provider).waitForTransaction(
        tx.hash
      );
      setLastWrappedHash(tx.hash);
    } catch (e: any) {
      console.error(e.message);
    }
    setIsWrapping(false);
  };

  const navigate = useNavigate();

  React.useEffect(() => {
    if (ethBalance.gt(prevEthBalance)) {
      setLastWrappedHash('');
    }
    setPrevEthBalance(ethBalance);
  }, [ethBalance]);
  return (
    <Card className={styles.root}>
      <Group position="apart" align="center" className={styles.inner}>
        <Stack spacing={1}>
          <Text size="sm" type="secondary">
            wETH Balance
          </Text>
          <Group spacing={1}>
            <Text className={styles.balance}>{formatAmount(wethBalance)}</Text>
            <WethSvg />
          </Group>
          <Text size="sm" type="secondary">
            ETH Balance <strong>{formatAmount(ethBalance)} ETH</strong>
          </Text>
        </Stack>
        <Stack spacing={10}>
          <Button
            className={styles.topUpButton}
            component="button"
            onClick={() => navigate('/vault/topup/method')}
          >
            Top-Up
          </Button>
          {(!ethBalance.isZero() || lastWrappedHash) && (
            <Button
              className={styles.wrapButton}
              onClick={onWrapClick}
              p={0}
              pl={2}
              disabled={isWrapping}
            >
              {lastWrappedHash
                ? 'Wrap Success'
                : isWrapping
                ? 'Wrapping'
                : 'Wrap ETH'}
              {lastWrappedHash ? (
                <ArrowUpRightSvg className={styles.wrapIcon} />
              ) : (
                <RecycleArrowsSvg
                  className={cn(styles.wrapIcon, isWrapping && styles.loading)}
                />
              )}
            </Button>
          )}
        </Stack>
      </Group>
    </Card>
  );
};

export default TopUpCard;
