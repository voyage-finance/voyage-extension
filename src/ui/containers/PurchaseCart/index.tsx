import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Divider, Group, Stack, Transition } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as WalletSvg } from 'assets/img/wallet.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DoodleSvg } from 'assets/img/doodle.svg';
import { ChevronDown } from 'tabler-icons-react';
import Button from '@components/Button';
import BuyMethodSelect, { PaymentOption } from '@components/BuyMethodSelect';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import BNPLSchedule from '@components/BNPLSchedule';
import { useAppSelector } from '@hooks/useRedux';

const PurchaseCart: React.FC = () => {
  const [pmtOption, setPmtOption] = React.useState(PaymentOption.BNPL);
  const [transaction] = useAppSelector((state) => {
    return Object.values(state.core.transactions);
  });
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
        <Group align="center" position="apart">
          <Text sx={{ fontSize: 32 }} weight={'bold'}>
            My cart
          </Text>
          <Group
            spacing={0}
            p={5}
            sx={{ borderRadius: 10, background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <WalletSvg />
            <Text weight={'bold'} ml={36}>
              6
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
              {transaction?.metadata?.metadata?.collection ||
                'undefined collection'}
            </Text>
          </Stack>
          <Stack spacing={0} ml="auto" align="end">
            <Group align="center" spacing={0}>
              <Text weight={'bold'} size="lg" ml={36}>
                {transaction?.metadata?.loanParameters?.principle || '—'}
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
            <Text type="secondary" mr={8}>
              $12.1K
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
        <Button fullWidth mt={24}>
          Pay 6 <EthSvg />
        </Button>
        <Button fullWidth mt={12} kind="secondary">
          Cancel
        </Button>
        <Group position="apart" align="center" mt={12}>
          <Stack spacing={0}>
            <Group spacing={0}>
              <EthSvg style={{ width: 11 }} />
              <Text
                size="sm"
                sx={{ lineHeight: '12px' }}
                ml={1}
                weight={'bold'}
              >
                0.00015
              </Text>
              <Text
                size="sm"
                sx={{ lineHeight: '12px' }}
                ml={4}
                type="secondary"
                weight={'bold'}
              >
                ~30 sec
              </Text>
            </Group>
            <Text size="sm" ml={3} sx={{ lineHeight: '12px' }} type="secondary">
              Estimated Gas Fee
            </Text>
          </Stack>
          <Group
            py={2}
            pl={10}
            pr={8}
            spacing={3}
            sx={{ borderRadius: 10, background: 'rgba(255, 255, 255, 0.1)' }}
          >
            ⛵<Text>Normal</Text>
            <ChevronDown style={{ marginTop: 1 }} size={18} />
          </Group>
        </Group>
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
