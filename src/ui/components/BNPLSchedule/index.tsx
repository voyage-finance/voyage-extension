import Text from '@components/Text';
import { Box, Group, GroupProps, Transition } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import styles from './index.module.scss';
import cn from 'classnames';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatAmount } from '@utils/bn';

interface IBNPLScheduleProps extends GroupProps {
  nper: number;
  epoch: number;
  payment: BigNumber;
}

const BNPLSchedule: React.FunctionComponent<IBNPLScheduleProps> = ({
  epoch,
  nper,
  payment,
  ...props
}) => {
  const [opened, setOpened] = React.useState(false);
  const [mounted, setMounter] = React.useState(false);

  React.useEffect(() => {
    console.log({ epoch, nper, payment });
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
            {[...Array(nper).keys()].map((i) => {
              const n = i + 1;
              const date = moment().add(epoch * i, 'days');
              return (
                <Group mt={16} align="center" spacing={0} key={i}>
                  <Box
                    sx={{
                      border: '3px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: 13,
                      height: 13,
                    }}
                  />
                  <Text weight="bold" ml={14}>
                    Payment {n}
                  </Text>
                  <Text ml={38}>
                    {n > 1 ? date.format('D MMM YYYY') : 'Today'}
                  </Text>
                  <Text sx={{ marginLeft: 'auto' }}>
                    {formatAmount(payment)}
                  </Text>
                  <EthSvg />
                </Group>
              );
            })}
          </Group>
        </Group>
      )}
    </Transition>
  );
};

export default BNPLSchedule;
