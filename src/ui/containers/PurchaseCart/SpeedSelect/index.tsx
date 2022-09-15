import Text from '@components/Text';
import { Box, BoxProps, Group, Menu, Stack } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import useVoyageController from '@hooks/useVoyageController';
import { useAppSelector } from '@hooks/useRedux';
import { decodeMarketplaceCalldata } from '@utils/decoder';
import { useParams } from 'react-router-dom';
interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: Speed;
  vault?: string;
  user?: string;
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

const SpeedSelect: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  vault,
  user,
  ...props
}) => {
  const { txId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [waitTime, setWaitTime] = React.useState(0);
  const [price, setPrice] = React.useState('');

  const controller = useVoyageController();
  const transaction = useAppSelector((state) => {
    return state.core.transactions[txId!];
  });

  const updateGasData = async () => {
    const { marketplace, tokenId, collection, data } =
      decodeMarketplaceCalldata(transaction.options);
    console.log('---- [updateGasData] values ----', {
      collection,
      tokenId: tokenId.toString(),
      vault,
      marketplace,
      user,
      data,
    });
    setLoading(true);
    try {
      const voyageRawTx = await controller.populateBuyNow(
        collection,
        tokenId.toString(),
        vault!,
        marketplace,
        data
      );
      console.log('---- voyageRawTx ----', voyageRawTx);
      if (voyageRawTx.data) {
        const estimateGasResponse = await fetch(
          `${process.env.VOYAGE_API_URL}/estimateGas`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              speed: value,
              request: await controller.createRelayHttpRequest(
                voyageRawTx.data,
                user!
              ),
            }),
          }
        );
        const body = await estimateGasResponse.json();
        console.log('------------ estimateGasResponse -------------', body);
        const fee = (body.networkFee / Math.pow(10, 9)).toFixed(5);
        setPrice(fee);
        setWaitTime(body.waitTime);
      }
    } catch (e) {
      console.log('[FAILED] at estimate gas', e);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    updateGasData();
  }, [value]);

  return (
    <Group position="apart" align="center" {...props}>
      <Stack spacing={0} sx={{ position: 'relative' }}>
        <Group spacing={0}>
          <EthSvg style={{ width: 11 }} />
          <Text size="sm" sx={{ lineHeight: '12px' }} ml={1} weight={'bold'}>
            {loading ? '...' : price}
          </Text>
          <Text
            size="sm"
            sx={{ lineHeight: '12px' }}
            ml={4}
            type="secondary"
            weight={'bold'}
          >
            ~{loading ? '...' : waitTime} sec
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
