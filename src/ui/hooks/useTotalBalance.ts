import { useEthBalance } from './useEthBalance';
import { useWEthBalance } from './useWEthBalance';

export const useTotalBalance = (address?: string, poll?: boolean) => {
  const [ethBalance, ethLoading] = useEthBalance(address, poll);
  const [wethBalance, wethLoading] = useWEthBalance(address, poll);

  return [ethBalance.plus(wethBalance), ethLoading || wethLoading] as const;
};
