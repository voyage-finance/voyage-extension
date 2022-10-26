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
import { getTxExplorerLink } from '@utils/env';

const TopUpCard: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const storedWrapEthTx = useAppSelector((state) => state.core.storedWrapEthTx);
  const [prevStoredWrapEthTx, setPrevStoredWrapEthTx] = React.useState<
    string | undefined
  >();
  const [ethBalance] = useEthBalance(vaultAddress, true);
  const [prevEthBalance, setPrevEthBalance] = React.useState(Zero);
  const [wethBalance] = useWEthBalance(vaultAddress!, true);

  const [isWrapping, setIsWrapping] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastWrappedHash, setLastWrappedHash] = React.useState('');

  const web3Provider = new ethers.providers.Web3Provider(provider);

  const checkForPendingWrapping = async () => {
    if (storedWrapEthTx) {
      if (storedWrapEthTx == 'initializing') {
        setIsWrapping(true);
        return;
      }
      setIsLoading(true);
      try {
        const txReceipt = await web3Provider.getTransactionReceipt(
          storedWrapEthTx
        );
        // The receipt is not available for pending transactions and returns null. https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#gettransactionreceipt
        if (!txReceipt) {
          setIsWrapping(true);
          await web3Provider.waitForTransaction(storedWrapEthTx);
          setLastWrappedHash(storedWrapEthTx);
        }
      } catch (e) {
        console.error('[checkForPendingWrapping]', checkForPendingWrapping);
      }
      setIsLoading(false);
      setIsWrapping(false);
    } else {
      setIsWrapping(false);
    }
  };

  const onWrapClick = async () => {
    if (isWrapping) return;
    if (lastWrappedHash) {
      window.open(getTxExplorerLink(lastWrappedHash), '_blank');
      return;
    }
    setIsWrapping(true);
    try {
      const txHash = await controller.wrapVaultETH(
        ethBalance.shiftedBy(ETHERS_DECIMALS)
      );
      showNotification({
        title: 'Started wrapping eth',
        message: '',
        hash: txHash,
        type: 'success',
      });
      // tx.wait is underfined, so using this
      await web3Provider.waitForTransaction(txHash);
      setLastWrappedHash(txHash);
    } catch (e: any) {
      console.error(e.message);
    }
    setIsWrapping(false);
  };

  const navigate = useNavigate();

  React.useEffect(() => {
    if (prevEthBalance && ethBalance.gt(prevEthBalance)) {
      setLastWrappedHash('');
    }
    setPrevEthBalance(ethBalance);
  }, [ethBalance]);

  React.useEffect(() => {
    checkForPendingWrapping();
  }, []);

  React.useEffect(() => {
    if (
      prevStoredWrapEthTx == 'initializing' &&
      storedWrapEthTx != 'initializing'
    )
      checkForPendingWrapping();
    setPrevStoredWrapEthTx(storedWrapEthTx);
  }, [storedWrapEthTx]);

  return (
    <Card className={styles.root}>
      <Group position="apart" align="center" className={styles.inner}>
        <Stack spacing={1}>
          <Text size="sm" type="secondary">
            wETH Balance
          </Text>
          <Group spacing={1}>
            <Text className={styles.balance}>
              {formatAmount(wethBalance, 3)}
            </Text>
            <WethSvg />
          </Group>
          <Text size="sm" type="secondary">
            ETH Balance <strong>{formatAmount(ethBalance, 3)} ETH</strong>
          </Text>
        </Stack>
        <Stack spacing={10}>
          <Group spacing={6}>
            <Button
              className={styles.topUpButton}
              component="button"
              onClick={() => navigate('/vault/topup/method')}
              px={8}
            >
              Deposit
            </Button>
            <Button
              className={styles.topUpButton}
              component="button"
              onClick={() => navigate('/send')}
              px={8}
            >
              Send
            </Button>
          </Group>
          {(!ethBalance.isZero() || lastWrappedHash) && (
            <Button
              className={styles.wrapButton}
              onClick={onWrapClick}
              p={0}
              pl={2}
              disabled={isWrapping || isLoading}
            >
              {isLoading
                ? 'Loading'
                : lastWrappedHash
                ? 'Wrap Success'
                : isWrapping
                ? 'Wrapping'
                : 'Wrap ETH'}
              {lastWrappedHash ? (
                <ArrowUpRightSvg className={styles.wrapIcon} />
              ) : (
                <RecycleArrowsSvg
                  className={cn(
                    styles.wrapIcon,
                    (isWrapping || isLoading) && styles.loading
                  )}
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
