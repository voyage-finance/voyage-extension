import Card from '@components/Card';
import Text from '@components/Text';
import { Box, Group, Image, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import Button from '@components/Button';
import { PaymentOption } from '@components/BuyMethodSelect';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import { useAppSelector } from '@hooks/useRedux';
import RepaymentSchedule from '../../components/moleculas/RepaymentSchedule';
import { useNavigate, useParams } from 'react-router-dom';
import { formatAmount, fromBigNumber, Zero } from '@utils/bn';
import BigNumber from 'bignumber.js';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import Link from '@components/Link';
import {
  getMarketplaceNameByAddress,
  getShortenedAddress,
  getTxExplorerLink,
} from '@utils/env';

const PurchaseConfirmed: React.FC = () => {
  const navigate = useNavigate();
  const { txId } = useParams();
  const [pmtOption] = React.useState(PaymentOption.BNPL);
  const transaction = useAppSelector((state) => {
    return state.core.transactions[txId!];
  });
  const orderPreview = transaction?.orderPreview;
  const collectionName = orderPreview?.metadata?.collectionName;
  const name = orderPreview?.metadata?.name || orderPreview?.metadata?.tokenId;
  const bnplPayment =
    orderPreview && orderPreview.loanParameters
      ? fromBigNumber(orderPreview.loanParameters.payment.pmt)
      : new BigNumber(0);
  const nper =
    orderPreview && orderPreview.loanParameters
      ? Number(orderPreview.loanParameters.nper)
      : 0;
  const epoch =
    orderPreview && orderPreview.loanParameters
      ? Number(orderPreview.loanParameters.epoch)
      : 0;
  const price = orderPreview?.price
    ? fromBigNumber(orderPreview.price)
    : undefined;
  const interest = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.interest)
    : undefined;
  const fee = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.fee)
    : undefined;
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
          <Image
            width={50}
            fit="contain"
            radius={10}
            height={50}
            src={orderPreview?.metadata?.image ?? PepePlacholderImg}
            alt="image"
          />
          <Stack spacing={0} ml={16}>
            <Text weight={'bold'} size="lg">
              {name || 'undefined name'}
            </Text>
            <Text type="secondary">
              {collectionName || 'undefined collection'}
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
            <Link
              ml="auto"
              link={getTxExplorerLink(transaction.hash || '')}
              text={getShortenedAddress(transaction.hash || '')}
            />
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment
            </Text>
            <PaymentHoverBoard
              price={price || Zero}
              fee={fee || Zero}
              pmt={bnplPayment || Zero}
              interest={interest || Zero}
              nper={nper}
              epoch={epoch}
            />
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
          </Group>
        </Stack>
        {pmtOption === PaymentOption.BNPL && (
          <RepaymentSchedule
            mt={4}
            nper={nper}
            epoch={epoch}
            payment={bnplPayment}
            transactions={transaction.hash ? [transaction.hash] : []}
          />
        )}
        <Button fullWidth mt={24} onClick={() => navigate('/collections')}>
          View My Collection
        </Button>
        {transaction.options.to && (
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
              Connected to{' '}
              <strong>
                {getMarketplaceNameByAddress(
                  transaction.options.to.toLowerCase()
                )}
              </strong>
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export default PurchaseConfirmed;
