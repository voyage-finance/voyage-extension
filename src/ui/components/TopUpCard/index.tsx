import * as React from 'react';
import Card from '@components/Card';
import styles from './index.module.scss';
import { Group, Stack } from '@mantine/core';
import Text from '@components/Text';
import { ReactComponent as WethSvg } from '@images/weth.svg';
// import { ReactComponent as RecycleArrowsSvg } from '@images/recycle-arrows.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { useEthBalance } from '@hooks/useEthBalance';
import { useAppSelector } from '@hooks/useRedux';
import { formatAmount } from '@utils/bn';
import { useWEthBalance } from '@hooks/useWEthBalance';

const TopUpCard: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [ethBalance] = useEthBalance(vaultAddress);
  const [wethBalance] = useWEthBalance(vaultAddress!);

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
        <Button
          className={styles.topUpButton}
          component="button"
          onClick={() => navigate('/vault/topup/method')}
        >
          Top-Up
        </Button>
      </Group>
    </Card>
  );
};

export default TopUpCard;
