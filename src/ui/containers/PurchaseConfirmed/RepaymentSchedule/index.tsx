import Text from '@components/Text';
import { Group, GroupProps, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ArrowUpRight, Check } from 'tabler-icons-react';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { formatAmount } from '@utils/bn';
import styles from './index.module.scss';
import { getShortenedAddress, getTxExplorerLink } from '@utils/env';

interface IRepaymentScheduleProps extends GroupProps {
  nper: number;
  epoch: number;
  payment: BigNumber;
  transactions: string[];
}

const RepaymentSchedule: React.FunctionComponent<IRepaymentScheduleProps> = ({
  epoch,
  nper,
  payment,
  transactions,
  ...props
}) => {
  const onPmtClick = (hash: string) => {
    window.open(getTxExplorerLink(hash), '_blank');
  };
  return (
    <Group direction="column" align="stretch" spacing={0} {...props}>
      <Group direction="column" align="stretch" spacing={0} noWrap>
        <Text size="lg" weight="bold" mt={16} mb={6}>
          Repayment Schedule
        </Text>
        {[...Array(Number(nper)).keys()].map((i) => {
          const n = i + 1;
          const daysLeft = epoch * i;
          const date = moment().add(epoch * i, 'days');
          return (
            <Group mt={10} align="center" spacing={0} key={i} noWrap>
              <div style={{ position: 'relative' }}>
                {i < transactions.length ? (
                  <Group
                    sx={{
                      borderRadius: '50%',
                      background: 'rgba(12, 205, 170, 1)',
                      height: 43,
                      width: 43,
                      color: 'white',
                      ':hover': {
                        cursor: 'pointer',
                        background: 'rgba(12, 205, 170, 0.9)',
                      },
                    }}
                    align="center"
                    position="center"
                    onClick={() => onPmtClick(transactions[i])}
                  >
                    <ArrowUpRight size={20} />
                  </Group>
                ) : (
                  <Group
                    sx={{
                      border: '3px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: 43,
                      height: 43,
                      color: 'rgba(255, 255, 255, 0.35)',
                    }}
                    align="center"
                    position="center"
                  >
                    <Check size={20} />
                  </Group>
                )}
                {n < nper && <div className={styles.schedulConnectLine} />}
              </div>
              <Stack spacing={0} ml={14} align="start">
                <Text weight="bold" size="lg">
                  {n > 1 ? date.format('D MMM YYYY') : 'Today'}
                </Text>
                <Text size="sm" type={n > 1 ? 'primary' : 'success'}>
                  {i >= transactions.length
                    ? `Due in ${daysLeft} days`
                    : `Paid • ${getShortenedAddress(transactions[i])}`}
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
