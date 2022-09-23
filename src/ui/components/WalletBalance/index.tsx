import Text from '@components/Text';
import { Group, GroupProps } from '@mantine/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useInterval } from '@mantine/hooks';
import { formatAmount, formatEthersBN, Zero } from '@utils/bn';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as DangerSvg } from 'assets/img/danger-icon.svg';
import { ReactComponent as CheckSvg } from 'assets/img/circle-check-icon.svg';

type IWalletBalanceProps = GroupProps & {
  address: string;
  minBalance?: BigNumber;
  onEnoughBalance?: () => void;
};

const WalletBalance: React.FunctionComponent<IWalletBalanceProps> = ({
  minBalance,
  address,
  onEnoughBalance,
  ...props
}) => {
  const [balance, setBalance] = React.useState(Zero);

  const pollBalance = React.useCallback(async () => {
    const res = formatEthersBN(await controller.getBalance(address));
    setBalance(res);
    if (minBalance && minBalance.lte(res)) onEnoughBalance?.();
  }, [address]);

  const balancePoll = useInterval(pollBalance, 5000);

  React.useEffect(() => {
    pollBalance();
    balancePoll.start();
    return balancePoll.stop;
  }, []);
  return (
    <Group direction="column" align="center" spacing={0} {...props}>
      <Text>Your Voyage Wallet Balance</Text>
      <Group mt={5} align="center" spacing={2} ml={32}>
        <Text sx={{ fontSize: 24 }} weight={'bold'}>
          {formatAmount(balance)}
        </Text>
        <EthSvg />
        {minBalance && (minBalance.lte(balance) ? <CheckSvg /> : <DangerSvg />)}
      </Group>
    </Group>
  );
};

export default WalletBalance;
