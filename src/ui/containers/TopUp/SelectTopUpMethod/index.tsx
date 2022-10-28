import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group } from '@mantine/core';
import * as React from 'react';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useAppSelector } from '@hooks/useRedux';
import { initRamp } from '@utils/ramp';
import { ChevronLeft } from 'tabler-icons-react';
import SettingsItem from '@components/SettingsItem';
import styles from './index.module.scss';

const SelectTopUpMethod: React.FC = () => {
  const navigate = useNavigate();
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [rampSdk, setRampSdk] = React.useState<RampInstantSDK>();

  const onDepositClick = async () => {
    navigate('/vault/topup/direct');
  };

  const onFiatClick = () => {
    rampSdk?.show();
  };

  React.useEffect(() => {
    if (vaultAddress) {
      setRampSdk(initRamp(vaultAddress));
    }
  }, [vaultAddress]);

  return (
    <Box p={24} className={styles.wrapper}>
      <SettingsItem iconLeft={<ChevronLeft />} handleClick={() => navigate(-1)}>
        <Text weight={700}>Back</Text>
      </SettingsItem>
      <Card px={28} py={14} mt={8}>
        <Group direction="column" align={'center'} spacing={0}>
          <Text sx={{ fontSize: 24 }} weight={'bold'} type="gradient">
            Select Deposit Method
          </Text>
          <Text mt={31} sx={{ fontSize: 20, whiteSpace: 'nowrap' }}>
            1 / <strong>Directly Deposit ETH</strong>
          </Text>
          <Box
            sx={{
              background: 'linear-gradient(90deg, #FFA620 0%, #EF5B25 100%)',
              width: 88,
              borderRadius: 4,
              textAlign: 'center',
            }}
            py={2}
            mt={8}
          >
            <Text size="sm" sx={{ lineHeight: '12px' }}>
              Quickest
            </Text>
          </Box>
          <Text mt={10} sx={{ lineHeight: '16px' }} align="center">
            If you’ve already got ETH, this is the quickest way to fund your
            Voyage Wallet.
          </Text>
          <Button mt={23} fullWidth onClick={onDepositClick}>
            Deposit ETH
          </Button>
          <Text mt={33} sx={{ fontSize: 20 }}>
            2 / <strong>Buy ETH with Fiat</strong>
          </Text>
          <Button mt={23} onClick={onFiatClick} fullWidth>
            Buy with Fiat
          </Button>
        </Group>
      </Card>
    </Box>
  );
};

export default SelectTopUpMethod;
