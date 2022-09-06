import Text from '@components/Text';
import {
  Box,
  BoxProps,
  Group,
  Menu,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import useVoyageController from '@hooks/useVoyageController';
import { BytesLike } from 'ethers';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: Speed;
  collection?: string;
  tokenId?: string;
  vault?: string;
  user?: string;
  calldata?: BytesLike;
  onRawTxChange: (rawTx: string) => void;
  onChange: (opt: Speed) => void;
}

export enum Speed {
  FAST = 'fast',
  NORMAL = 'normal',
  SLOW = 'slow',
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

export const LOOKS_EXCHANGE_RINKEBY =
  '0x1AA777972073Ff66DCFDeD85749bDD555C0665dA';

const SpeedSelect: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  collection,
  tokenId,
  vault,
  calldata,
  onRawTxChange,
  ...props
}) => {
  const user = '0xAD5792b1D998f607d3EEB2f357138A440B03f19f';
  const [loading, setLoading] = React.useState(false);
  const [waitTime, setWaitTime] = React.useState(0);
  const [price, setPrice] = React.useState(0);

  const controller = useVoyageController();

  const updateGasData = async () => {
    console.log('---- voyage raw tx body ----', {
      collection,
      tokenId,
      vault,
      LOOKS_EXCHANGE_RINKEBY,
    });

    if (collection && tokenId && vault && calldata && user) {
      setLoading(true);
      const voyageRawTx = await controller.populateBuyNow(
        collection, //'0x6C5AE80Bcf0Ec85002FE8eb3Ce267232614127C0',
        tokenId, //'1000',
        vault, //'0x9BB2Eac903B1Ff35825eBFECE63758eEB49a731F',
        LOOKS_EXCHANGE_RINKEBY,
        calldata
      );
      console.log('---- voyageRawTx ----', voyageRawTx);
      onRawTxChange(voyageRawTx.data as string);
      const estimateGasResponse = await fetch(
        `${process.env.VOYAGE_API_URL}/estimateGas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            speed: value,
            from: user,
            calldata: voyageRawTx.data,
          }),
        }
      );
      const body = await estimateGasResponse.json();
      console.log('------------ estimateGasResponse -------------', body);
      setPrice(body.networkFee);
      setWaitTime(body.waitTime);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    updateGasData();
  }, [value]);

  return (
    <Group position="apart" align="center" {...props}>
      <Stack spacing={0} sx={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Group spacing={0}>
          <EthSvg style={{ width: 11 }} />
          <Text size="sm" sx={{ lineHeight: '12px' }} ml={1} weight={'bold'}>
            {price}
          </Text>
          <Text
            size="sm"
            sx={{ lineHeight: '12px' }}
            ml={4}
            type="secondary"
            weight={'bold'}
          >
            ~{waitTime} sec
          </Text>
        </Group>
        <Text size="sm" ml={3} sx={{ lineHeight: '12px' }} type="secondary">
          Estimated Gas Fee
        </Text>
      </Stack>
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
    </Group>
  );
};

export default SpeedSelect;
