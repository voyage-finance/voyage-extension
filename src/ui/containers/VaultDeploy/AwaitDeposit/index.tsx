import Card from '@components/Card';
import Text from '@components/Text';
import { Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import QrCode from '@components/QrCode';
import CopyButton from '@components/CopyButton';
import WalletBalance from '../../../components/WalletBalance';
import { MIN_DEPOSIT } from '@utils/bn';

const AwaitDeposit: React.FC = () => {
  const controller = useVoyageController();
  const [isLoading, setIsLoading] = React.useState(false);
  const [depositedEnough, setDepositedEnough] = React.useState(false);

  const [address, setAddress] = React.useState('');

  const fetchVaultAddress = async () => {
    setIsLoading(true);
    const address = await controller.computeCounterfactualAddress();
    setAddress(address || '');
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchVaultAddress();
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
          Directly Deposit ETH
        </Text>
        <Text mt={18} sx={{ lineHeight: '16px' }} align="center">
          Deposit ETH (on Ethereum Network) to create your very own Voyage
          vault. Gas used to deploy your own Voyage Vault will be automatically
          deducted from your deposited balance.
        </Text>
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
        <Group direction="column" mt={23} align="center" spacing={0}>
          <Text>Minimum ETH Required</Text>
          <Group mt={5} align="center" spacing={2} ml={5}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              {MIN_DEPOSIT.toString()}
            </Text>
            <EthSvg />
          </Group>
          <Text type="secondary" mt={4}>
            ~$100
          </Text>
        </Group>
        {address && (
          <WalletBalance
            minBalance={MIN_DEPOSIT}
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
