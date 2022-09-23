import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group } from '@mantine/core';
import * as React from 'react';
import QrCode from '@components/QrCode';
import CopyButton from '@components/CopyButton';
import WalletBalance from '../../../components/WalletBalance';
import { useAppSelector } from '@hooks/useRedux';

const DirectTopUp: React.FC = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);

  return (
    <Box px={24} py={18} sx={{ width: '100%' }}>
      <Card
        sx={{
          margin: 'auto',
          padding: '24px',
          width: '100%',
        }}
      >
        <Group
          direction="column"
          align={'center'}
          spacing={0}
          sx={{ width: '100%' }}
        >
          <Text sx={{ fontSize: 24 }} weight={'bold'} type="gradient">
            Directly Deposit ETH
          </Text>
          <Text mt={14} align="center">
            Your Voyage Wallet
            <br />
            <strong>Ethereum Network</strong>
          </Text>
          <QrCode mt={14} address={vaultAddress || ''} />
          <Group
            mt={14}
            sx={{
              borderRadius: 10,
              background: 'rgba(27, 29, 44, 0.6)',
              width: '100%',
            }}
            noWrap
            py={12}
            px={16}
          >
            <Text type="gradient" sx={{ wordBreak: 'break-all' }}>
              {vaultAddress}
            </Text>
            {vaultAddress && <CopyButton ml="auto" text={vaultAddress} />}
          </Group>
          {vaultAddress && <WalletBalance address={vaultAddress} mt={22} />}
        </Group>
      </Card>
    </Box>
  );
};

export default DirectTopUp;
