import { WETH_ADDRESS } from '@utils/constants';
import { useContractRead } from 'wagmi';
import Weth9Abi from 'abis/weth9.json';
import { useInterval } from '@mantine/hooks';
import { useEffect } from 'react';
import { getChainID } from '@utils/config';

export const useWETHAllowance = (
  owner: string,
  spender: string,
  poll?: boolean
) => {
  const weth9 = WETH_ADDRESS[getChainID()];
  const {
    data,
    isLoading,
    refetch: updateAllowance,
  } = useContractRead({
    addressOrName: weth9,
    contractInterface: Weth9Abi,
    functionName: 'allowance',
    args: [owner, spender],
    enabled: false,
  });

  const balancePoll = useInterval(updateAllowance, 3000);

  useEffect(() => {
    updateAllowance();
    if (poll) balancePoll.start();
    return balancePoll.stop;
  }, [owner, spender]);

  return [data ?? '0', isLoading] as const;
};
