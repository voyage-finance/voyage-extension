import Text from '@components/Text';
import { Box, BoxProps, Group, Menu } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: Speed;
  onChange: (opt: Speed) => void;
}

export enum Speed {
  FAST,
  NORMAL,
  SLOW,
}

export type SpeedConfig = {
  type: Speed;
  label: string;
  time: number;
  priceFrom: number;
  priceTo: number;
};

const SPEEDS: Record<Speed, SpeedConfig> = {
  [Speed.FAST]: {
    type: Speed.FAST,
    label: '🚤 Fast',
    time: 10,
    priceFrom: 12,
    priceTo: 15,
  },
  [Speed.NORMAL]: {
    type: Speed.NORMAL,
    label: '⛵ Normal',
    time: 30,
    priceFrom: 12,
    priceTo: 15,
  },
  [Speed.SLOW]: {
    type: Speed.SLOW,
    label: '🛶 Slow',
    time: 30,
    priceFrom: 12,
    priceTo: 15,
  },
};

const SpeedSelect: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <Menu
      shadow="md"
      control={
        <Group
          py={2}
          pl={10}
          pr={8}
          spacing={3}
          sx={{
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            ':hover': { cursor: 'pointer' },
          }}
        >
          <Text>{SPEEDS[value].label}</Text>
          <ChevronDown style={{ marginTop: 1 }} size={18} />
        </Group>
      }
      position="top"
      placement="end"
      styles={{
        body: {
          background: 'linear-gradient(180deg, #333C62 0%, #25283D 100%)',
          border: 'none',
          borderRadius: 10,
          padding: '21px 8px',
          width: 236,
        },
        item: {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 10,
          padding: 12,
        },
        itemHovered: {
          background: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'transparent',
        },
        itemLabel: {
          width: '100%',
        },
      }}
      {...props}
    >
      <Text size="lg" weight="bold" ml={13}>
        Transaction Speed
      </Text>
      <Group direction="column" spacing={5} mt={6}>
        {Object.values(SPEEDS).map((speed) => (
          <Menu.Item
            icon={
              value === speed.type ? (
                <CheckOrangeSvg />
              ) : (
                <Box
                  sx={{
                    border: '2px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: '50%',
                    width: 15,
                    height: 15,
                  }}
                />
              )
            }
            onClick={() => onChange(speed.type)}
          >
            <Group spacing={0} noWrap>
              <Text sx={{ whiteSpace: 'nowrap' }}>{speed.label}</Text>
              <Text
                sx={{ whiteSpace: 'nowrap' }}
                type="secondary"
                size="sm"
                ml={2}
              >
                ~ {speed.time} sec
              </Text>
              <Text sx={{ whiteSpace: 'nowrap' }} size="sm" ml="auto">
                {speed.priceFrom}-{speed.priceTo} Gwei
              </Text>
            </Group>
          </Menu.Item>
        ))}
      </Group>
    </Menu>
  );
};

export default SpeedSelect;
