import Text from '@components/Text';
import { Group, Menu, Stack } from '@mantine/core';
import * as React from 'react';
import { ChevronDown } from 'tabler-icons-react';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';
import { ReactComponent as WethSvg } from 'assets/img/weth.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { useAppSelector } from '@hooks/useRedux';
import { useEthBalance } from '@hooks/useEthBalance';
import { useWEthBalance } from '@hooks/useWEthBalance';
import { formatAmount } from '@utils/bn';

export enum TOKEN {
  WETH,
  ETH,
}

const CurrencySelector: React.FunctionComponent<{
  value?: TOKEN;
  onChange: (value: TOKEN) => void;
}> = ({ value, onChange }) => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [ethBalance] = useEthBalance(vaultAddress, true);
  const [wethBalance] = useWEthBalance(vaultAddress!, true);

  return (
    <Menu
      shadow="md"
      control={
        <Group
          py={6}
          px={8}
          spacing={0}
          sx={{
            borderRadius: 10,
            background: 'rgba(27, 29, 44, 0.6)',
            ':hover': { cursor: 'pointer' },
          }}
        >
          {value != undefined &&
            (value == TOKEN.ETH ? <EthSvg /> : <WethSvg />)}
          <Stack spacing={0} ml={8}>
            <Text weight="bold">
              {value != undefined
                ? value == TOKEN.ETH
                  ? 'Ethereum'
                  : 'Wrapped Ethereum'
                : 'Select Token'}
            </Text>
            <Text type="secondary" size="sm">
              {value != undefined
                ? `Balance: ${formatAmount(
                    value == TOKEN.ETH ? ethBalance : wethBalance
                  )}`
                : '–'}
            </Text>
          </Stack>
          <ChevronDown style={{ marginTop: 1, marginLeft: 'auto' }} size={18} />
        </Group>
      }
      position="bottom"
      placement="end"
      styles={{
        body: {
          width: 306,
          height: 352,
          borderRadius: 10,
          background: '#242940',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 10,
          overflowY: 'scroll',
          position: 'relative',
        },
        item: {
          borderRadius: 10,
          padding: '6px 8px',
        },
        itemLabel: {
          display: 'flex',
          alignItems: 'center',
        },
        itemHovered: {
          background: 'rgba(27, 29, 44, 0.6)',
        },
      }}
    >
      <Group direction="column" spacing={6}>
        <Menu.Item
          onClick={() => onChange(TOKEN.ETH)}
          rightSection={value == TOKEN.ETH ? <CheckOrangeSvg /> : undefined}
        >
          <EthSvg />
          <Stack spacing={0} ml={8}>
            <Text weight="bold">Ethereum</Text>
            <Text type="secondary" size="sm">
              Balance: {formatAmount(ethBalance)} ETH
            </Text>
          </Stack>
        </Menu.Item>
        <Menu.Item
          onClick={() => onChange(TOKEN.WETH)}
          rightSection={value == TOKEN.WETH ? <CheckOrangeSvg /> : undefined}
        >
          <WethSvg />
          <Stack spacing={0} ml={8}>
            <Text weight="bold">Wrapped Ethereum</Text>
            <Text type="secondary" size="sm">
              Balance: {formatAmount(wethBalance)} wETH
            </Text>
          </Stack>
        </Menu.Item>
      </Group>
    </Menu>
  );
};

export default CurrencySelector;
