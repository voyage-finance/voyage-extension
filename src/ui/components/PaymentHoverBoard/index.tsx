import { Box, Divider, Group, Popover } from '@mantine/core';
import * as React from 'react';
import { useState } from 'react';
import { ReactComponent as InfoCircleSvg } from 'assets/img/info-circle.svg';
import styles from './index.module.scss';
import Text from '@components/Text';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import BigNumber from 'bignumber.js';
import { formatAmount } from '@utils/bn';

type IProps = {
  price: BigNumber;
  pmt: BigNumber;
  interest: BigNumber;
  fee: BigNumber;
  nper: number;
  epoch: number;
};

const PaymentHoverBoard: React.FunctionComponent<IProps> = ({
  pmt,
  price,
  interest,
  fee,
  nper = 0,
  epoch = 0,
}) => {
  const [opened, setOpened] = useState(false);

  console.log({ pmt, interest, nper, epoch });

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
              {formatAmount(price)}
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Group align="center" spacing={0}>
            <Text>Interest</Text>
            <Text weight={'bold'} ml="auto">
              {formatAmount(interest.multipliedBy(nper))}
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          <Group align="center" spacing={0}>
            <Text>Platform fee</Text>
            <Text weight={'bold'} ml="auto">
              {formatAmount(fee.multipliedBy(nper))}
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group>
          {/* <Group align="center" spacing={0}>
            <Text>Loan fee </Text>
            <Text weight={'bold'} ml="auto">
              0.24
            </Text>
            <EthSvg style={{ width: 19 }} />
          </Group> */}
          <Divider my={13} />
          <Group align="center" spacing={0}>
            <Text>Total Bill</Text>
            <Text weight="bold" ml="auto" type="gradient">
              {formatAmount(pmt.multipliedBy(nper))}
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
                {formatAmount(pmt)}
              </Text>
              <EthSvg style={{ width: 18 }} />
              <Text style={{ lineHeight: 1 }}>/ {epoch} days</Text>
            </Group>
            <Text ml="auto" size="sm" style={{ lineHeight: 1, marginTop: -4 }}>
              {nper} payments
            </Text>
          </Group>
        </Group>
      </Box>
    </Popover>
  );
};

export default PaymentHoverBoard;
