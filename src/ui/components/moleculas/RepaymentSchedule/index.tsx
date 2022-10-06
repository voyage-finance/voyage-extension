import Text from '@components/Text';
import { Group, GroupProps, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { formatAmount } from '@utils/bn';
import styles from './index.module.scss';
import { getShortenedAddress } from '@utils/env';
import StatusIcon from './statusIcon';

interface IRepaymentScheduleProps extends GroupProps {
  nper: number;
  epoch: number;
  payment: BigNumber;
  transactions: string[];
  borrowAt?: number;
}

const RepaymentSchedule: React.FunctionComponent<IRepaymentScheduleProps> = ({
  epoch,
  nper,
  payment,
  transactions,
  borrowAt,
  ...props
}) => {
  const paidTimes = transactions.length;
  const loanStartDate = borrowAt ? moment(borrowAt * 1000) : moment();
  const now = moment();
  return (
    <Group direction="column" align="stretch" spacing={0} {...props}>
      <Group direction="column" align="stretch" spacing={0} noWrap>
        <Text size="lg" weight="bold" mt={16} mb={6}>
          Repayment Schedule
        </Text>
        {[...Array(Number(nper)).keys()].map((i) => {
          const n = i + 1;
          const pmtDate =
            i == 0 ? loanStartDate : loanStartDate.add(epoch, 'days');
          const daysLeft = pmtDate.diff(now, 'days');
          return (
            <Group mt={10} align="center" spacing={0} key={i} noWrap>
              <div style={{ position: 'relative' }}>
                <StatusIcon tx={transactions[i]} isNext={i == paidTimes} />
                {n < nper && <div className={styles.schedulConnectLine} />}
              </div>
              <Stack spacing={0} ml={14} align="start">
                <Text weight="bold" size="lg">
                  {borrowAt ? pmtDate.format('D MMM YYYY') : 'Today'}
                </Text>
                <Text
                  size="sm"
                  type={
                    i < paidTimes
                      ? 'success'
                      : daysLeft <= 3
                      ? 'danger'
                      : daysLeft <= epoch
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {i < paidTimes
                    ? `Paid • ${getShortenedAddress(transactions[i])}`
                    : daysLeft > 0
                    ? `Due in ${daysLeft} days`
                    : 'Overdue'}
                </Text>
              </Stack>
              <Text size="lg" weight="bold" sx={{ marginLeft: 'auto' }}>
                {formatAmount(payment)}
              </Text>
              <EthSvg />
            </Group>
          );
        })}
      </Group>
    </Group>
  );
};

export default RepaymentSchedule;
