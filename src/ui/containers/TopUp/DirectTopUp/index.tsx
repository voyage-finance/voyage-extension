import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group, Stack } from '@mantine/core';
import * as React from 'react';
import QrCode from '@components/QrCode';
import CopyButton from '@components/CopyButton';
import WalletBalance from '../../../components/WalletBalance';
import { useAppSelector } from '@hooks/useRedux';
import { ChevronLeft } from 'tabler-icons-react';
import SettingsItem from '@components/SettingsItem';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const DirectTopUp: React.FC = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const navigate = useNavigate();

  return (
    <Box px={24} py={18} className={styles.wrapper}>
      <Stack>
        <SettingsItem
          iconLeft={<ChevronLeft />}
          handleClick={() => navigate(-1)}
        >
          <Text weight={700}>Back</Text>
        </SettingsItem>

        <Card
          px={28}
          py={14}
          mb={60}
          sx={{
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
      </Stack>
    </Box>
  );
};

export default DirectTopUp;
