import { useCallback, useEffect, useState } from 'react';
import { useInterval } from '@mantine/hooks';
import { formatEthersBN, Zero } from '@utils/bn';

export const useEthBalance = (address?: string, poll?: boolean) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(Zero);

  const fetchBalance = useCallback(async () => {
    if (address) {
      console.log('🚀 ~ fetchBalance ~ address', address);
      setLoading(true);
      const res = formatEthersBN(await controller.getBalance(address));
      setBalance(res);
      setLoading(false);
    }
  }, [address]);

  const balancePoll = useInterval(fetchBalance, 5000);

  useEffect(() => {
    console.log(
      '🚀 ~ file: useEthBalance.ts ~ line 25 ~ useEthBalance ~ address',
      address
    );
    fetchBalance();
    if (poll) balancePoll.start();
    return balancePoll.stop;
  }, [address]);

  return [balance, loading] as const;
};
