import Text from '@components/Text';
import { Box, BoxProps, Group, Menu } from '@mantine/core';
import * as React from 'react';
import { Check, ChevronDown } from 'tabler-icons-react';

interface IBuyMethodSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: PaymentOption;
  onChange: (opt: PaymentOption) => void;
}

export enum PaymentOption {
  PAY_NOW = 'Pay Now',
  BNPL = 'Voyage BNPL',
}

const BuyMethodSelect: React.FunctionComponent<IBuyMethodSelectProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <Menu
      shadow="md"
      control={
        <Group
          pb={2}
          pl={20}
          pr={8}
          spacing={3}
          sx={{
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            ':hover': { cursor: 'pointer' },
          }}
        >
          <Text weight="bold" type="gradient">
            {value}
          </Text>
          <ChevronDown style={{ marginTop: 1 }} size={18} />
        </Group>
      }
      {...props}
    >
      <Menu.Item
        icon={
          value === PaymentOption.BNPL ? <Check size={14} /> : <Box mr={14} />
        }
        onClick={() => onChange(PaymentOption.BNPL)}
      >
        {PaymentOption.BNPL}
      </Menu.Item>
      <Menu.Item
        icon={
          value === PaymentOption.PAY_NOW ? (
            <Check size={14} />
          ) : (
            <Box mr={14} />
          )
        }
        onClick={() => onChange(PaymentOption.PAY_NOW)}
      >
        {PaymentOption.PAY_NOW}
      </Menu.Item>
    </Menu>
  );
};

export default BuyMethodSelect;
