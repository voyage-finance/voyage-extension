import Text from '@components/Text';
import { Box, Group, GroupProps, Transition } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import styles from './index.module.scss';
import cn from 'classnames';

interface IBNPLScheduleProps extends GroupProps {}

const BNPLSchedule: React.FunctionComponent<IBNPLScheduleProps> = (props) => {
  const [opened, setOpened] = React.useState(false);
  const [mounted, setMounter] = React.useState(false);
  React.useEffect(() => {
    setMounter(true);
  }, []);
  return (
    <Transition
      mounted={mounted}
      transition="pop"
      duration={500}
      timingFunction="ease"
    >
      {(style) => (
        <Group
          direction="column"
          align="stretch"
          spacing={0}
          style={style}
          {...props}
        >
          <Group
            position="center"
            className={styles.activatorActivator}
            spacing={0}
            onClick={() => setOpened(!opened)}
          >
            <Text size="sm">Show BNPL Repayment Schedule</Text>
            <ChevronDown
              className={cn(styles.chevron, opened && styles.up)}
              style={{ marginTop: 1 }}
              size={18}
            />
          </Group>
          <Group
            className={cn(styles.accordionBody, opened && styles.opened)}
            direction="column"
            align="stretch"
            spacing={0}
            noWrap
          >
            <Text size="lg" weight="bold" mt={16}>
              Payment Schedule
            </Text>
            <Group mt={16} align="center" spacing={0}>
              <Box
                sx={{
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: 13,
                  height: 13,
                }}
              />
              <Text weight="bold" ml={14}>
                Payment 1
              </Text>
              <Text ml={38}>Today</Text>
              <Text sx={{ marginLeft: 'auto' }}>2.1</Text>
              <EthSvg />
            </Group>
            <Group mt={20} align="center" spacing={0}>
              <Box
                sx={{
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: 13,
                  height: 13,
                }}
              />
              <Text weight="bold" ml={14}>
                Payment 2
              </Text>
              <Text ml={38}>2 Aug 2022</Text>
              <Text sx={{ marginLeft: 'auto' }}>2.1</Text>
              <EthSvg />
            </Group>
            <Group mt={20} align="center" spacing={0}>
              <Box
                sx={{
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: 13,
                  height: 13,
                }}
              />
              <Text weight="bold" ml={14}>
                Payment 3
              </Text>
              <Text ml={38}>2 Sep 2022</Text>
              <Text sx={{ marginLeft: 'auto' }}>2.1</Text>
              <EthSvg />
            </Group>
          </Group>
        </Group>
      )}
    </Transition>
  );
};

export default BNPLSchedule;
