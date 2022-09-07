import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Divider, Group, Loader, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReactComponent as WalletSvg } from 'assets/img/wallet.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DoodleSvg } from 'assets/img/doodle.svg';
import Button from '@components/Button';
import BuyMethodSelect, { PaymentOption } from '@components/BuyMethodSelect';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import BNPLSchedule from '@components/BNPLSchedule';
import { useAppSelector } from '@hooks/useRedux';
import SpeedSelect, { Speed } from './SpeedSelect';
import { useEthBalance } from '@hooks/useEthBalance';
import { formatAmount, formatEthersBN } from '@utils/bn';
import useVoyageController from '@hooks/useVoyageController';
import { useNavigate } from 'react-router-dom';
import {
  LOOKS_EXCHANGE_RINKEBY,
  PURCHASE_OVERVIEW_ROUTE,
} from '@utils/constants';
import { BigNumber } from 'ethers';

const PurchaseCart: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pmtOption, setPmtOption] = useState(PaymentOption.BNPL);
  const [speed, setSpeed] = useState(Speed.FAST);
  const [transaction] = useAppSelector((state) => {
    return Object.values(state.core.transactions);
  });
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const userAddress = useAppSelector((state) => state.core.account?.address);
  const [balance, balanceLoading] = useEthBalance(vaultAddress);

  const controller = useVoyageController();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('------- transaction --------', transaction);
    controller.fetchVault();
  }, []);

  const price = formatEthersBN(transaction?.metadata?.price);
  const bnplPayment = formatEthersBN(transaction.metadata?.loanParameters?.pmt);
  const nper = transaction.metadata?.loanParameters.nper;
  const epoch = transaction.metadata?.loanParameters.epoch;

  const handleBuyClick = async () => {
    console.log('[handleBuyClick] transaction: ', transaction);
    setIsLoading(true);
    await controller.buyNow(
      transaction?.metadata?.metadata?.collectionAddress,
      transaction?.metadata?.metadata?.tokenId,
      vaultAddress!,
      LOOKS_EXCHANGE_RINKEBY,
      transaction?.options.data!
    );
    navigate(`${PURCHASE_OVERVIEW_ROUTE}/confirmed`);
    setIsLoading(false);
  };

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
      }}
      py={40}
      px={56}
    >
      <Stack spacing={0} align="stretch">
        <Group align="center" position="apart" noWrap>
          <Text sx={{ fontSize: 32 }} weight={'bold'}>
            My cart
          </Text>
          <Group
            spacing={0}
            p={5}
            sx={{
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              minWidth: 98,
            }}
            noWrap
          >
            <WalletSvg />
            <Text weight={'bold'} ml={'auto'}>
              {balanceLoading ? <Loader size={14} /> : formatAmount(balance)}
            </Text>
            <EthSvg style={{ width: 24 }} />
          </Group>
        </Group>
        <Group mt={15}>
          <DoodleSvg />
          <Stack spacing={0}>
            <Text weight={'bold'} size="lg">
              {transaction?.metadata?.metadata?.name ||
                transaction?.metadata?.metadata?.tokenId ||
                'undefined name'}
            </Text>
            <Text type="secondary">
              {transaction?.metadata?.metadata?.collectionName ||
                'undefined collection'}
            </Text>
          </Stack>
          <Stack spacing={0} ml="auto" align="end">
            <Group align="center" spacing={0}>
              <Text weight={'bold'} size="lg" ml={36}>
                {formatAmount(price) || '—'}
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
            <Text type="secondary" mr={8}>
              $ —
            </Text>
          </Stack>
        </Group>
        <Divider size={1.5} color="rgba(255, 255, 255, 0.35)" my={23} />
        <Stack spacing={14} align="stretch">
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment Option
            </Text>
            {pmtOption === PaymentOption.BNPL && <PaymentHoverBoard />}
            <BuyMethodSelect
              ml="auto"
              value={pmtOption}
              onChange={setPmtOption}
            />
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Amount Due
            </Text>
            {pmtOption === PaymentOption.PAY_NOW ? (
              <Group ml="auto" align="center" spacing={0}>
                <Text weight={'bold'} size="lg" ml={36} type="gradient">
                  {formatAmount(price) || '—'}
                </Text>
                <EthSvg style={{ width: 24 }} />
              </Group>
            ) : (
              <Group ml="auto" direction="column" align="end" spacing={0}>
                <Group position="right" spacing={0}>
                  <Text
                    ml="auto"
                    weight="bold"
                    type="gradient"
                    style={{ lineHeight: 1 }}
                  >
                    {formatAmount(bnplPayment)}
                  </Text>
                  <EthSvg style={{ width: 18 }} />
                  <Text style={{ lineHeight: 1 }}>/ {epoch} days</Text>
                </Group>
                <Text
                  ml="auto"
                  size="sm"
                  style={{ lineHeight: 1, marginTop: -4 }}
                >
                  {nper} payments
                </Text>
              </Group>
            )}
          </Group>
        </Stack>
        {pmtOption === PaymentOption.BNPL && (
          <BNPLSchedule
            mt={20}
            nper={nper}
            epoch={epoch}
            payment={bnplPayment}
          />
        )}
        <Button fullWidth mt={24} onClick={handleBuyClick} loading={isLoading}>
          Pay{' '}
          {pmtOption === PaymentOption.PAY_NOW
            ? formatAmount(price)
            : formatAmount(bnplPayment)}{' '}
          <EthSvg />
        </Button>
        <Button fullWidth mt={12} kind="secondary">
          Cancel
        </Button>

        <SpeedSelect
          value={speed}
          onChange={setSpeed}
          mt={12}
          collection={transaction?.metadata?.metadata?.collectionAddress}
          tokenId={transaction?.metadata?.metadata?.tokenId}
          vault={vaultAddress}
          user={userAddress}
          calldata={transaction?.options.data}
        />

        <Group position="center" mt={22} spacing={6}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'rgba(12, 205, 170, 1)',
            }}
          />
          <Text size="sm" sx={{ lineHeight: '12px' }}>
            Connected to <strong>Looksrare</strong>
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default PurchaseCart;
