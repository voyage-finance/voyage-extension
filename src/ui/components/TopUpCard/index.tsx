import * as React from 'react';
import Card from '@components/Card';
import styles from './index.module.scss';
import { Group, Stack } from '@mantine/core';
import Text from '@components/Text';
import { ReactComponent as WethSvg } from '@images/weth.svg';
import { ReactComponent as RecycleArrowsSvg } from '@images/recycle-arrows.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { useEthBalance } from '@hooks/useEthBalance';
import { useAppSelector } from '@hooks/useRedux';
import { formatAmount } from '@utils/bn';
import { useWEthBalance } from '@hooks/useWEthBalance';
import cn from 'classnames';
import BigNumber from 'bignumber.js';
import showNotification from '@utils/notification';
import { ethers } from 'ethers';

const TopUpCard: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [ethBalance] = useEthBalance(vaultAddress, true);
  const [wethBalance] = useWEthBalance(vaultAddress!, true);

  const [isWrapping, setIsWrapping] = React.useState(false);

  const onWrapClick = async () => {
    if (isWrapping) return;
    setIsWrapping(true);
    try {
      const tx = await controller.wrapVaultETH(
        new BigNumber('1000000000000000')
      );
      showNotification({
        title: 'Started wrapping eth',
        message: '',
        hash: tx.hash,
        type: 'success',
      });
      // await tx.wait(+process.env.NUM_CONFIRMATIONS!); wait is underfined
      await new ethers.providers.Web3Provider(provider).waitForTransaction(
        tx.hash
      );
      showNotification({
        title: 'Wrap success',
        message: `Wrapped ${formatAmount(ethBalance)} ETH successfully.`,
        hash: tx.hash,
        type: 'success',
      });
    } catch (e: any) {
      console.error(e.message);
    }
    setIsWrapping(false);
  };

  const navigate = useNavigate();
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
          <Button className={styles.wrapButton} onClick={onWrapClick}>
            Wrap ETH
            <RecycleArrowsSvg
              className={cn(styles.wrapIcon, isWrapping && styles.loading)}
            />
          </Button>
        </Stack>
      </Group>
    </Card>
  );
};

export default TopUpCard;
