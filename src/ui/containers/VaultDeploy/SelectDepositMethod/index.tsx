import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { MIN_DEPOSIT } from '@utils/bn';
import { useUsdValueOfEth } from '@hooks/useCoinPrice';

const SelectDepositMethod: React.FC = () => {
  const [isInfoCardShown, setIsInfoCardShown] = React.useState(true);

  return isInfoCardShown ? (
    <InfoCard onClick={() => setIsInfoCardShown(false)} />
  ) : (
    <MethodsCard />
  );
};

const InfoCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [usdValue, usdValueLoading] = useUsdValueOfEth(MIN_DEPOSIT);

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '52px 60px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <Text sx={{ fontSize: 24 }} weight={'bold'} type="gradient">
          Deposit ETH
        </Text>
        <Text mt={18} sx={{ lineHeight: '16px' }} align="center">
          Deposit ETH (on Ethereum Network) to create your very own Voyage
          vault. Gas used to deploy your Voyage Vault will be automatically
          deducted from your deposited balance.
        </Text>
        <Group direction="column" mt={25} align="center" spacing={0}>
          <Text>Minimum ETH Required</Text>
          <Group mt={5} align="center" spacing={2} ml={5}>
            <Text sx={{ fontSize: 24 }} weight={'bold'}>
              {MIN_DEPOSIT.toString()}
            </Text>
            <EthSvg />
          </Group>
          <Text type="secondary" mt={4}>
            {usdValueLoading ? '$...' : usdValue}
          </Text>
        </Group>
        <Button mt={25} onClick={onClick} sx={{ width: 300 }}>
          Select Deposit Method
        </Button>
      </Group>
    </Card>
  );
};

const MethodsCard = () => {
  const navigate = useNavigate();

  const onDepositClick = async () => {
    navigate('/vault/deposit/await');
  };

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '48px 60px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <Text sx={{ fontSize: 24 }} weight={'bold'} type="gradient">
          Select Deposit Method
        </Text>
        <Text mt={10} sx={{ lineHeight: '16px' }} align="center">
          Deposit ETH (on Ethereum Network) to create your very own Voyage
          vault. Gas used to deploy your Voyage Vault will be automatically
          deducted from your deposited balance.
        </Text>
        <Text mt={31} sx={{ fontSize: 24 }}>
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
        <Button mt={23} sx={{ width: 300 }} onClick={onDepositClick}>
          Deposit ETH
        </Button>
        <Text mt={33} sx={{ fontSize: 24 }}>
          2 / <strong>Buy ETH with Fiat</strong>
        </Text>
        <Text mt={8} sx={{ lineHeight: '16px' }} align="center">
          Credit card, Apple Pay, and bank transfers (depending on location) in
          over 100 countries. ETH is deposited directly into your Voyage wallet
          after payment.
        </Text>
        <Button mt={23} sx={{ width: 300 }} disabled>
          Coming Soon
        </Button>
      </Group>
    </Card>
  );
};

export default SelectDepositMethod;
