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
import { formatAmount } from '@utils/bn';
import useVoyageController from '@hooks/useVoyageController';

const PurchaseCart: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pmtOption, setPmtOption] = useState(PaymentOption.BNPL);
  const [speed, setSpeed] = useState(Speed.FAST);
  const [rawTx, setRawTx] = useState('');
  const [transaction] = useAppSelector((state) => {
    return Object.values(state.core.transactions);
  });
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const userAddress = useAppSelector((state) => state.core.account?.address);
  const [balance, balanceLoading] = useEthBalance(vaultAddress);

  const controller = useVoyageController();

  useEffect(() => {
    console.log('------- transaction --------', transaction);
    controller.fetchVault();
  }, []);

  const handleBuyClick = async () => {
    setIsLoading(true);
    controller.testGsn();
    // const relayTransaction = await fetch(
    //   `${process.env.VOYAGE_API_URL}/relayTransaction`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       speed: 'normal',
    //       from: userAddress,
    //       calldata: rawTx,
    //     }),
    //   }
    // );
    // const body = await relayTransaction.json();
    // console.log('------------ estimateGasResponse -------------', body);
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
                {transaction?.metadata?.metadata?.loanParameters?.principle ||
                  '—'}
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
                  6
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
                    6.3
                  </Text>
                  <EthSvg style={{ width: 18 }} />
                  <Text style={{ lineHeight: 1 }}>/ 30 days</Text>
                </Group>
                <Text
                  ml="auto"
                  size="sm"
                  style={{ lineHeight: 1, marginTop: -4 }}
                >
                  3 payments
                </Text>
              </Group>
            )}
          </Group>
        </Stack>
        {pmtOption === PaymentOption.BNPL && <BNPLSchedule mt={20} />}
        <Button fullWidth mt={24} onClick={handleBuyClick} loading={isLoading}>
          Pay 6 <EthSvg />
        </Button>
        <Button fullWidth mt={12} kind="secondary">
          Cancel
        </Button>

        <SpeedSelect
          value={speed}
          onChange={setSpeed}
          mt={12}
          collection={'0x6C5AE80Bcf0Ec85002FE8eb3Ce267232614127C0'}
          tokenId={transaction?.metadata?.metadata?.tokenId}
          vault={vaultAddress}
          user={userAddress}
          calldata={transaction?.options.data}
          onRawTxChange={setRawTx}
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
            Connected to <strong>OpenSea</strong>
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default PurchaseCart;
