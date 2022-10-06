import { formatEthersBN } from '@utils/bn';
import { fetchLoanList } from 'api';
import { useEffect, useState } from 'react';
import { ILoan } from 'types';
import { useAppSelector } from './useRedux';

export const useFetchMyLoans = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [loans, setLoans] = useState<ILoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = async () => {
    if (!vaultAddress) return;
    setIsLoading(true);
    try {
      setLoans(
        (await fetchLoanList(vaultAddress)).map((loanRes) => ({
          ...loanRes,
          principal: formatEthersBN(loanRes.principal),
        }))
      );
    } catch (e) {
      console.error('[useFetchMyLoans]', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [vaultAddress]);

  return [loans, isLoading] as const;
};
