import Card from '@components/Card';
import Text from '@components/Text';
import { Divider, Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as WalletSvg } from 'assets/img/wallet.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DoodleSvg } from 'assets/img/doodle.svg';
import { ReactComponent as InfoCircleSvg } from 'assets/img/info-circle.svg';
import { ChevronDown } from 'tabler-icons-react';
import Button from '@components/Button';

const PurchaseCart: React.FC = () => {
  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
      }}
      py={40}
      px={56}
    >
      <Group direction="column" spacing={0} align="stretch">
        <Group align="center" position="apart">
          <Text sx={{ fontSize: 32 }} weight={'bold'}>
            My cart
          </Text>
          <Group
            spacing={0}
            p={5}
            sx={{ borderRadius: 10, background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <WalletSvg />
            <Text weight={'bold'} ml={36}>
              6
            </Text>
            <EthSvg style={{ width: 24 }} />
          </Group>
        </Group>
        <Group mt={15}>
          <DoodleSvg />
          <Group direction="column" spacing={0}>
            <Text weight={'bold'} size="lg">
              Doodle #2122
            </Text>
            <Text type="secondary">Doodles</Text>
          </Group>
          <Group direction="column" spacing={0} ml="auto" align="end">
            <Group align="center" spacing={0}>
              <Text weight={'bold'} size="lg" ml={36}>
                6
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
            <Text type="secondary" mr={8}>
              $12.1K
            </Text>
          </Group>
        </Group>
        <Divider size={1.5} color="rgba(255, 255, 255, 0.35)" my={23} />
        <Group direction="column" spacing={14} align="stretch">
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment Option
            </Text>
            <InfoCircleSvg />
            <Group
              ml="auto"
              py={3}
              pl={20}
              pr={8}
              spacing={3}
              sx={{ borderRadius: 10, background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Text weight="bold" type="gradient">
                Pay Now
              </Text>
              <ChevronDown size={18} />
            </Group>
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Amount Due
            </Text>
            <Group ml="auto" align="center" spacing={0}>
              <Text weight={'bold'} size="lg" ml={36} type="gradient">
                6
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
          </Group>
        </Group>
        <Button fullWidth mt={24}>
          Pay 6 <EthSvg />
        </Button>
        <Button fullWidth mt={12} kind="secondary">
          Cancel
        </Button>
      </Group>
    </Card>
  );
};

export default PurchaseCart;
