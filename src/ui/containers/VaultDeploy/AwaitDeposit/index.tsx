import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as CopySvg } from 'assets/img/copy-icon.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DangerSvg } from 'assets/img/danger-icon.svg';
import { ReactComponent as CheckSvg } from 'assets/img/circle-check-icon.svg';
import Button from '@components/Button';

const AwaitDeposit: React.FC = () => {
  const [deposited] = React.useState(false);
  const address = '0x4C616d9377Fa8d928385F0b11Ab16D4bf0f2d544';
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
          <Text type="gradient">{address}</Text>
          <Box sx={{ cursor: 'pointer' }}>
            <CopySvg />
          </Box>
        </Group>
        <Group direction="column" mt={23} align="center" spacing={0}>
          <Text>Minimum ETH Required</Text>
          <Group mt={5} align="center" spacing={2} ml={5}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              0.25
            </Text>
            <EthSvg />
          </Group>
          <Text type="secondary" mt={4}>
            ~$500
          </Text>
        </Group>
        <Group direction="column" mt={22} align="center" spacing={0}>
          <Text>Your Voyage Wallet Balance</Text>
          <Group mt={5} align="center" spacing={2} ml={32}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              0.25
            </Text>
            <EthSvg />
            {deposited ? <CheckSvg /> : <DangerSvg />}
          </Group>
        </Group>
        <Button mt={34} sx={{ width: 380 }} disabled={!deposited}>
          Create Vault
        </Button>
      </Group>
    </Card>
  );
};

export default AwaitDeposit;
