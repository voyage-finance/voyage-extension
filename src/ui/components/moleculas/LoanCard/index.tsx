import * as React from 'react';
import VoyagePaper from '@components/Card';
import moment from 'moment';
import styles from './index.module.scss';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ILoan } from 'types';
import { formatAmount } from '@utils/bn';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'tabler-icons-react';
import { Group, Image, Stack } from '@mantine/core';
import Text from '@components/Text';

const PaymentInfoLabel = ({
  nper,
  paidTimes,
  nextPaymentDue,
  closed,
  liquidated,
}: {
  nper: number;
  paidTimes: number;
  closed: boolean;
  liquidated: boolean;
  nextPaymentDue: number;
}) => {
  const now = moment();
  const daysToNextPayment = moment((nextPaymentDue ?? 0) * 1000).diff(
    now,
    'days'
  );

  return (
    <Text
      size="sm"
      type={
        closed
          ? 'success'
          : liquidated
          ? 'secondary'
          : daysToNextPayment > 3
          ? 'warning'
          : 'danger'
      }
    >
      {closed
        ? 'Paid'
        : liquidated
        ? 'Defaulted'
        : daysToNextPayment > 0
        ? `${paidTimes + 1}/${nper} • Due in ${daysToNextPayment} days`
        : 'Overdue'}
    </Text>
  );
};

const LoanCard: React.FunctionComponent<{ loan: ILoan }> = ({ loan }) => {
  const navigate = useNavigate();
  return (
    <VoyagePaper
      className={styles.card}
      onClick={() =>
        navigate(`/loans/${loan.vault}_${loan.collection}_${loan.loanId}`)
      }
    >
      <Group spacing={0} align="center" noWrap>
        <Image
          width={38}
          height={38}
          fit="contain"
          radius={10}
          src={loan.metadata?.image || PepePlacholderImg}
          alt="image"
        />
        <Stack spacing={0} ml={12}>
          <Text size="lg" weight="bold">
            {loan.metadata?.name || loan.tokenId}
          </Text>
          <PaymentInfoLabel
            nper={loan.nper}
            paidTimes={loan.paidTimes}
            nextPaymentDue={loan.nextPaymentDue}
            closed={loan.closed}
            liquidated={loan.liquidated}
          />
        </Stack>
        <Text size="lg" weight="bold" ml="auto">
          {formatAmount(loan.principal)}
        </Text>
        <EthSvg />
        <ChevronRight color="rgba(255, 255, 255, 0.35)" />
      </Group>
    </VoyagePaper>
  );
};

export default LoanCard;
