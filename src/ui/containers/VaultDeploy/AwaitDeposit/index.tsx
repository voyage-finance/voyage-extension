import Card from '@components/Card';
import Text from '@components/Text';
import { Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DangerSvg } from 'assets/img/danger-icon.svg';
import { ReactComponent as CheckSvg } from 'assets/img/circle-check-icon.svg';
import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import QrCode from '@components/QrCode';
import CopyButton from '@components/CopyButton';
import { useInterval } from '@mantine/hooks';
import { formatEthersBN, Zero } from '@utils/bn';

const MIN_DEPOSIT = 0.00005;

const AwaitDeposit: React.FC = () => {
  const controller = useVoyageController();
  const [isLoading, setIsLoading] = React.useState(false);
  const [deposited] = React.useState(false);
  const [balance, setBalance] = React.useState(Zero);
  const [address, setAddress] = React.useState('');

  const pollBalance = async () => {
    setBalance(formatEthersBN(await controller.getBalance(address)));
  };
  const balancePoll = useInterval(pollBalance, 5000);

  const fetchVaultAddress = async () => {
    setIsLoading(true);
    const address = await controller.computeCounterfactualAddress();
    setAddress(address || '');
    if (address) {
      pollBalance();
      balancePoll.start();
    }
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
              {MIN_DEPOSIT}
            </Text>
            <EthSvg />
          </Group>
          <Text type="secondary" mt={4}>
            ~$100
          </Text>
        </Group>
        <Group direction="column" mt={22} align="center" spacing={0}>
          <Text>Your Voyage Wallet Balance</Text>
          <Group mt={5} align="center" spacing={2} ml={32}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              {balance.toString()}
            </Text>
            <EthSvg />
            {deposited ? <CheckSvg /> : <DangerSvg />}
          </Group>
        </Group>
        <Button mt={34} sx={{ width: 380 }} disabled={!deposited}>
          {deposited ? 'Create Vault' : 'Insufficient Balace to Deploy Vault'}
        </Button>
      </Group>
    </Card>
  );
};

export default AwaitDeposit;
