import { ChainID, WETH_ADDRESS } from '@utils/constants';
import { useContractRead } from 'wagmi';
import Weth9Abi from 'abis/weth9.json';
import { formatEthersBN } from '@utils/bn';
import { useInterval } from '@mantine/hooks';
import { useEffect } from 'react';

export const useWEthBalance = (address: string, poll?: boolean) => {
  const weth = WETH_ADDRESS[+process.env.CHAIN_ID! as ChainID];
  const {
    data,
    isLoading,
    refetch: fetchBalance,
  } = useContractRead({
    addressOrName: weth,
    contractInterface: Weth9Abi,
    functionName: 'balanceOf',
    args: address,
    enabled: false,
  });

  const balancePoll = useInterval(fetchBalance, 3000);

  useEffect(() => {
    fetchBalance();
    if (poll) balancePoll.start();
    return balancePoll.stop;
  }, [address]);

  return [data ? formatEthersBN(data) : data, isLoading] as const;
};
