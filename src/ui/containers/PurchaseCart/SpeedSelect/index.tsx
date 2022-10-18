import Text from '@components/Text';
import { Box, BoxProps, Group, Loader, Menu, Stack } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import useVoyageController from '@hooks/useVoyageController';
import { useAppSelector } from '@hooks/useRedux';
import { decodeMarketplaceCalldata } from '@utils/decoder';
import { useParams } from 'react-router-dom';
import cn from 'classnames';
import styles from './index.module.scss';
import { TxSpeed } from 'types';
import { useGasSpeeds } from '@hooks/useGasSpeeds';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: TxSpeed;
  vault?: string;
  user?: string;
  onChange: (opt: TxSpeed) => void;
}

const SpeedSelect: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  vault,
  user,
  ...props
}) => {
  const { txId } = useParams();
  const [isGasLoading, setGasLoading] = React.useState(false);
  const [speeds, isSpeedsLoading] = useGasSpeeds();
  const [gas, setGas] = React.useState(0);
  const [error, setError] = React.useState('');
  const controller = useVoyageController();
  const transaction = useAppSelector((state) => {
    return state.core.transactions[txId!];
  });

  const updateGasData = async () => {
    const { marketplace, tokenId, collection, data } =
      decodeMarketplaceCalldata(transaction.options);
    setGasLoading(true);
    try {
      const voyageRawTx = await controller.populateBuyNow(
        collection,
        tokenId.toString(),
        vault!,
        marketplace,
        data
      );
      if (voyageRawTx.data) {
        const estimateGasResponse = await fetch(
          `${process.env.VOYAGE_API_URL}/estimateGas`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              speed: 'fast', // will be removed for next version of api
              request: await controller.createRelayHttpRequest(
                voyageRawTx.data,
                user!
              ),
            }),
          }
        );
        const body = await estimateGasResponse.json();
        setGas(body.gas);
      }
    } catch (e: any) {
      console.log('[FAILED] at estimate gas', e);
      setError(e.message);
    }
    setGasLoading(false);
  };

  React.useEffect(() => {
    updateGasData();
  }, []);

  return !error ? (
    <Group position="apart" align="center" {...props}>
      <Stack spacing={0}>
        <Group spacing={0}>
          <EthSvg style={{ width: 11 }} />
          {!isGasLoading && speeds[value].values ? (
            <>
              <Text
                size="sm"
                sx={{ lineHeight: '12px' }}
                ml={1}
                weight={'bold'}
                className={cn(isSpeedsLoading && styles.animatePulse)}
              >
                {(
                  (gas * speeds[value].values!.maxFeePerGas) /
                  Math.pow(10, 9)
                ).toFixed(5)}
              </Text>
              <Text
                size="sm"
                sx={{ lineHeight: '12px' }}
                ml={4}
                type="secondary"
                weight={'bold'}
              >
                {`~${speeds[value].values!.maxWaitTime} sec`}
              </Text>
            </>
          ) : (
            <>
              <Text size="sm">Fetching</Text>
              <Loader ml={4} size={12} color="#fff" />
            </>
          )}
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
            <Text>{speeds[value].label}</Text>
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
          {Object.values(speeds).map((speed, i) => (
            <Menu.Item
              key={i}
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
                  className={cn(isSpeedsLoading && styles.animatePulse)}
                >
                  ~ {speed.values?.maxWaitTime || '...'} sec
                </Text>
                <Text
                  sx={{ whiteSpace: 'nowrap' }}
                  size="sm"
                  ml="auto"
                  className={cn(isSpeedsLoading && styles.animatePulse)}
                >
                  {speed.values?.maxFeePerGas} Gwei
                </Text>
              </Group>
            </Menu.Item>
          ))}
        </Group>
      </Menu>
    </Group>
  ) : (
    <></>
  );
};

export default SpeedSelect;
