import { Box, Divider, Group, Popover } from '@mantine/core';
import * as React from 'react';
import { useState } from 'react';
import { ReactComponent as InfoCircleSvg } from 'assets/img/info-circle.svg';
import styles from './index.module.scss';
import Text from '@components/Text';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';

interface IPaymentHoverBoardProps {}

const PaymentHoverBoard: React.FunctionComponent<IPaymentHoverBoardProps> = (
  props
) => {
  const [opened, setOpened] = useState(false);
  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      placement="center"
      trapFocus={false}
      closeOnEscape={false}
      transition="pop-top-left"
      width={232}
      spacing={0}
      styles={{
        root: { height: 24 },
        body: {
          pointerEvents: 'none',
          marginTop: -12,
          border: 'none',
        },
        popover: {
          borderRadius: 10,
          background: 'linear-gradient(180deg, #333C62 0%, #25283D 100%)',
          border: 'none',
        },
        target: {
          ':hover': {
            cursor: 'pointer',
            path: {
              stroke: 'rgba(255, 166, 32, 1)',
              strokeOpacity: 1,
            },
          },
        },
      }}
      target={
        <InfoCircleSvg
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
        >
          Hover badge to see popover
        </InfoCircleSvg>
      }
    >
      <Box className={styles.popoverWrapper}>
        <Group direction="column" spacing={0} align="stretch">
          <Text size="lg" weight="bold">
            Your Breakdown
          </Text>
          <Group align="center" spacing={0}>
            <Text>Purchase</Text>
            <Text weight={'bold'} ml="auto">
              6
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Group align="center" spacing={0}>
            <Text>Platform (1%)</Text>
            <Text weight={'bold'} ml="auto">
              0.06
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Group align="center" spacing={0}>
            <Text>Loan fee (4%)</Text>
            <Text weight={'bold'} ml="auto">
              0.24
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Divider my={13} />
          <Group align="center" spacing={0}>
            <Text>Total Bill</Text>
            <Text weight="bold" ml="auto" type="gradient">
              6.3
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Group direction="column" align="end" spacing={0}>
            <Group position="right" spacing={0}>
              <Text
                ml="auto"
                weight="bold"
                type="gradient"
                style={{ lineHeight: 1 }}
              >
                6.3
              </Text>
              <EthSvg style={{ width: 18 }} />
              <Text style={{ lineHeight: 1 }}>/ 30 days</Text>
            </Group>
            <Text ml="auto" size="sm" style={{ lineHeight: 1, marginTop: -4 }}>
              3 payments
            </Text>
          </Group>
        </Group>
      </Box>
    </Popover>
  );
};

export default PaymentHoverBoard;
