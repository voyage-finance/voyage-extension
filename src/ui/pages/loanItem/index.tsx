import TitleWithLine from '@components/atoms/TitleWithLine';
import { Group, Image, LoadingOverlay, Stack } from '@mantine/core';
import * as React from 'react';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import styles from './index.module.scss';
import Text from '@components/Text';
import Link from '@components/Link';
import { getShortenedAddress, getTxExplorerLink } from '@utils/env';
import { formatAmount, Zero } from '@utils/bn';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { useFetchLoan } from '@hooks/useFetchLoan';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import RepaymentsWrapped from './repaymentsWrapped';
import PaymentHoverBoard from '@components/PaymentHoverBoard';

const LoanItemPage: React.FunctionComponent = () => {
  const { id } = useParams();

  const [vault, collection, loanId] = id!.split('_');

  const {
    loan,
    isLoading: isLoanLoading,
    refetch,
  } = useFetchLoan(vault, collection, loanId);

  const getDaysLeft = (nextPaymentDue: number) =>
    moment(nextPaymentDue * 1000).diff(moment(), 'days');

  return (
    <div className={styles.wrapper}>
      <div className={styles.root}>
        <LoadingOverlay visible={isLoanLoading} />
        {loan && (
          <Stack spacing={0}>
            <TitleWithLine>Summary</TitleWithLine>
            <Image
              width={123}
              height={123}
              mx="auto"
              mt={12}
              fit="contain"
              radius={10}
              src={PepePlacholderImg}
              alt="image"
            />
            <Text size="xl" weight="bold" align="center" mt={12}>
              {loan?.metadata?.name || loan?.tokenId}
            </Text>
            <Text type="secondary" align="center">
              {loan?.borrowAt &&
                `Purchased on ${moment(loan.borrowAt * 1000).format(
                  'D MMM YYYY'
                )}`}
            </Text>
            <Text size="lg" weight="bold">
              Purchase Details
            </Text>
            <Stack spacing={12}>
              <Group position="apart" align="center" spacing={0}>
                <Text type="secondary" mr={4}>
                  Transaction ID
                </Text>
                <Link
                  link={getTxExplorerLink(loan?.transaction.txHash || '')}
                  text={getShortenedAddress(loan?.transaction.txHash || '')}
                />
              </Group>
              <Group align="center" spacing={0}>
                <Text type="secondary" mr={4}>
                  Total Payable
                </Text>
                <PaymentHoverBoard
                  price={loan?.principal || Zero}
                  pmt={loan?.pmtPmt || Zero}
                  interest={loan?.pmtInterest || Zero}
                  nper={loan?.nper || 0}
                  epoch={loan?.epoch || 0}
                />
                <Text
                  ml="auto"
                  weight="bold"
                  size="lg"
                  style={{ lineHeight: 1 }}
                >
                  {loan?.interest && loan?.principal
                    ? formatAmount(loan.principal.plus(loan.interest))
                    : '-'}
                </Text>
                <EthSvg />
              </Group>
              <Group position="apart" align="center" spacing={0}>
                <Text type="secondary">Payment Status</Text>
                <Text
                  px={12}
                  py={2}
                  sx={{
                    borderRadius: 10,
                    background: loan.closed
                      ? '#0CCDAA'
                      : loan.liquidated
                      ? '#A4A5A8'
                      : getDaysLeft(loan.nextPaymentDue) > 3
                      ? '#FFA620'
                      : '#F41B6A',
                  }}
                >
                  {loan.closed
                    ? 'Paid'
                    : loan.liquidated
                    ? 'Defaulted'
                    : getDaysLeft(loan.nextPaymentDue) > 0
                    ? `Due in ${getDaysLeft(loan.nextPaymentDue)} days`
                    : 'Overdue'}
                </Text>
              </Group>
            </Stack>
            {loan && (
              <RepaymentsWrapped
                loan={loan}
                refetch={refetch}
                isLoading={isLoanLoading}
              />
            )}
          </Stack>
        )}
      </div>
    </div>
  );
};

export default LoanItemPage;
