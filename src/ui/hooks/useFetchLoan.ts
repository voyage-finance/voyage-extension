import { formatEthersBN } from '@utils/bn';
import { fetchLoan } from 'api';
import { useEffect, useState } from 'react';
import { ILoan } from 'types';

export const useFetchLoan = (id: string) => {
  const [loan, setLoan] = useState<ILoan>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchItem = async () => {
    setIsLoading(true);
    try {
      const loanRes = await fetchLoan(id);
      setLoan({
        ...loanRes,
        principal: formatEthersBN(loanRes.principal),
        interest: formatEthersBN(loanRes.interest),
        pmtPrincipal: formatEthersBN(loanRes.pmtPrincipal),
        pmtPmt: formatEthersBN(loanRes.pmtPmt),
        pmtFee: formatEthersBN(loanRes.pmtFee),
        pmtInterest: formatEthersBN(loanRes.pmtInterest),
      });
    } catch (e) {
      console.error('[useFetchLoan]', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItem();
  }, []);

  return [loan, isLoading] as const;
};
