import Text from '@components/Text';
import { Box, Group, GroupProps, Stack } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ArrowUpRight, Check } from 'tabler-icons-react';

interface IRepaymentScheduleProps extends GroupProps {}

const RepaymentSchedule: React.FunctionComponent<IRepaymentScheduleProps> = (
  props
) => {
  return (
    <Group direction="column" align="stretch" spacing={0} {...props}>
      <Group direction="column" align="stretch" spacing={0} noWrap>
        <Text size="lg" weight="bold" mt={16}>
          Repayment Schedule
        </Text>
        <Group mt={16} align="center" spacing={0}>
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
          <Stack spacing={0} ml={14}>
            <Text weight="bold" size="lg">
              Payment 1
            </Text>
            <Text size="sm">Today</Text>
          </Stack>
          <Text size="lg" weight="bold" sx={{ marginLeft: 'auto' }}>
            2.1
          </Text>
          <EthSvg />
        </Group>
        <Group mt={10} align="center" spacing={0}>
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
          <Stack spacing={0} ml={14}>
            <Text weight="bold" size="lg">
              Payment 1
            </Text>
            <Text size="sm">Today</Text>
          </Stack>
          <Text size="lg" weight="bold" sx={{ marginLeft: 'auto' }}>
            2.1
          </Text>
          <EthSvg />
        </Group>
        <Group mt={10} align="center" spacing={0}>
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
          <Stack spacing={0} ml={14}>
            <Text weight="bold" size="lg">
              Payment 1
            </Text>
            <Text size="sm">Today</Text>
          </Stack>
          <Text size="lg" weight="bold" sx={{ marginLeft: 'auto' }}>
            2.1
          </Text>
          <EthSvg />
        </Group>
      </Group>
    </Group>
  );
};

export default RepaymentSchedule;
