import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DoodleSvg } from 'assets/img/doodle.svg';
import { ReactComponent as ArrowSvg } from 'assets/img/arrow-top-right-gradient.svg';
import Button from '@components/Button';
import { PaymentOption } from '@components/BuyMethodSelect';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import { useAppSelector } from '@hooks/useRedux';
import RepaymentSchedule from './RepaymentSchedule';

const PurchaseConfirmed: React.FC = () => {
  const [pmtOption] = React.useState(PaymentOption.BNPL);
  const [transaction] = useAppSelector((state) => {
    return Object.values(state.core.transactions);
  });
  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
      }}
      pt={50}
      pb={40}
      px={56}
    >
      <Stack spacing={0} align="stretch">
        <Text
          sx={{ fontSize: 24 }}
          weight={'bold'}
          type="gradient"
          align="center"
        >
          Purchase Confirmed!
        </Text>
        <Text align="center" mt={12}>
          You’ve got yourself a keeper :)
        </Text>
        <Group mt={23} position="center" spacing={0}>
          <DoodleSvg />
          <Stack spacing={0} ml={16}>
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
        </Group>
        <Stack mt={30} spacing={14} align="stretch">
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment Option
            </Text>
            <Group
              spacing={0}
              px={12}
              py={2}
              ml="auto"
              sx={{ borderRadius: 10, background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Text>{PaymentOption.BNPL}</Text>
            </Group>
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Transaction ID
            </Text>
            <Text
              size="lg"
              ml="auto"
              weight="bold"
              type="gradient"
              sx={{ ':hover': { cursor: 'pointer' } }}
            >
              0x915...dsny6
            </Text>
            <ArrowSvg />
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment
            </Text>
            <PaymentHoverBoard />
            <Group ml="auto" direction="column" align="end" spacing={0}>
              <Group position="right" spacing={0}>
                <Text
                  ml="auto"
                  weight="bold"
                  type="gradient"
                  style={{ lineHeight: 1 }}
                >
                  2.1
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
          </Group>
        </Stack>
        {pmtOption === PaymentOption.BNPL && <RepaymentSchedule mt={4} />}
        <Button fullWidth mt={24}>
          View My Collection
        </Button>
        <Button fullWidth mt={12} kind="secondary">
          Look for More Treasures!
        </Button>
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

export default PurchaseConfirmed;
