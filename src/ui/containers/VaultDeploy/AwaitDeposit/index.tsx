import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import QrCode from '@components/QrCode';
import CopyButton from '@components/CopyButton';
import WalletBalance from '../../../components/WalletBalance';
import { useUsdValueOfEth } from '@hooks/useCoinPrice';
import { formatAmount } from '@utils/bn';
import { useFetchVaultWatcherParams } from '@hooks/useFetchVaultWatcherParams';
import { useInterval } from '@mantine/hooks';
import { useParams } from 'react-router-dom';
import RampView from './rampView';

const AwaitDeposit: React.FC = () => {
  const { method } = useParams();
  const isDirectMethod = method == 'direct';
  const controller = useVoyageController();
  const [
    minDeposit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    isVaultWatcherParamsLoading,
  ] = useFetchVaultWatcherParams();

  const [usdValue] = useUsdValueOfEth(minDeposit);
  const [isLoading, setIsLoading] = React.useState(false);
  const [depositedEnough, setDepositedEnough] = React.useState(false);
  const [address, setAddress] = React.useState('');

  const fetchVaultAddress = async () => {
    setIsLoading(true);
    const address = await controller.registerVaultWatcher(
      maxFeePerGas.toString(),
      maxPriorityFeePerGas.toString()
    );
    setAddress(address || '');
    setIsLoading(false);
  };

  const pollVaultAddress = useInterval(controller.fetchVault, 5000);

  React.useEffect(() => {
    if (!isVaultWatcherParamsLoading && !maxFeePerGas.isZero())
      fetchVaultAddress();
  }, [isVaultWatcherParamsLoading]);

  React.useEffect(() => {
    pollVaultAddress.start();
    return pollVaultAddress.stop;
  }, []);

  return (
    <Card
      style={{
        width: 480,
        margin: 'auto',
      }}
      py={60}
    >
      <Group direction="column" align={'center'} spacing={0} mx={34}>
        <Text sx={{ fontSize: 24 }} weight={'bold'} type="gradient">
          {isDirectMethod ? 'Directly Deposit ETH' : 'Buy ETH with Fiat'}
        </Text>
        {isDirectMethod ? (
          <>
            <Text mt={23}>
              Your Voyage Wallet | <strong>Ethereum Network</strong>
            </Text>
            <QrCode mt={14} isLoading={isLoading} address={address} />
            <Group
              mt={14}
              sx={{
                borderRadius: 10,
                background: 'rgba(27, 29, 44, 0.6)',
                width: '100%',
              }}
              noWrap
              py={17}
              px={25}
            >
              <Text type="gradient">{isLoading ? 'Loading...' : address}</Text>
              {address && <CopyButton text={address} />}
            </Group>
          </>
        ) : (
          <Box mt={23}>
            <RampView vaultAddress={address} usdValue={usdValue} />
          </Box>
        )}
        <Group direction="column" mt={23} align="center" spacing={0}>
          <Text>Minimum ETH Required</Text>
          <Group mt={5} align="center" spacing={2} ml={5}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              {formatAmount(minDeposit)}
            </Text>
            <EthSvg />
          </Group>
          <Text type="secondary" mt={4}>
            {`$${usdValue}`}
          </Text>
        </Group>
        {address && (
          <WalletBalance
            minBalance={minDeposit}
            address={address}
            onEnoughBalance={() => setDepositedEnough(true)}
            mt={22}
          />
        )}
        <Button
          mt={34}
          sx={{ width: 380 }}
          disabled={!depositedEnough}
          loading={depositedEnough}
        >
          {depositedEnough
            ? 'Creating Vault'
            : 'Insufficient Balace to Deploy Vault'}
        </Button>
      </Group>
    </Card>
  );
};

export default AwaitDeposit;
