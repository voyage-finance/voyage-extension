import { WETH9_GOERLI } from '@utils/constants';
import { useContractRead } from 'wagmi';
import Weth9Abi from 'abis/weth9.json';
import { formatEthersBN } from '@utils/bn';

export const useWEthBalance = (address: string) => {
  const { data, isLoading, refetch } = useContractRead({
    addressOrName: WETH9_GOERLI,
    contractInterface: Weth9Abi,
    functionName: 'balanceOf',
    args: address,
  });

  return [data ? formatEthersBN(data) : data, isLoading, refetch] as const;
};
