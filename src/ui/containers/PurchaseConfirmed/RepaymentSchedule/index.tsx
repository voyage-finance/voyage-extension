import Text from '@components/Text';
import { Group, GroupProps, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ArrowUpRight, Check } from 'tabler-icons-react';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { formatAmount } from '@utils/bn';

interface IRepaymentScheduleProps extends GroupProps {
  nper: number;
  epoch: number;
  payment: BigNumber;
}

const RepaymentSchedule: React.FunctionComponent<IRepaymentScheduleProps> = ({
  epoch,
  nper,
  payment,
  ...props
}) => {
  return (
    <Group direction="column" align="stretch" spacing={0} {...props}>
      <Group direction="column" align="stretch" spacing={0} noWrap>
        <Text size="lg" weight="bold" mt={16}>
          Repayment Schedule
        </Text>
        {[...Array(Number(nper)).keys()].map((i) => {
          const n = i + 1;
          const date = moment().add(epoch * i, 'days');
          return (
            <Group mt={16} align="center" spacing={0} key={i}>
              {n == 1 ? (
                <Group
                  sx={{
                    borderRadius: '50%',
                    background: 'rgba(12, 205, 170, 1)',
                    height: 43,
                    width: 43,
                    color: 'white',
                  }}
                  align="center"
                  position="center"
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
              <Stack spacing={0} ml={14}>
                <Text weight="bold" size="lg">
                  Payment {n}
                </Text>
                <Text size="sm">
                  {' '}
                  {n > 1 ? date.format('D MMM YYYY') : 'Today'}
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
