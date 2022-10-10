import { formatEthersBN } from '@utils/bn';
import { fetchLoan } from 'api';
import { useEffect, useState } from 'react';
import { ILoan } from 'types';
import { useInterval } from '@mantine/hooks';

export const useFetchLoan = (
  vault: string,
  collection: string,
  loanId: string
) => {
  const [loan, setLoan] = useState<ILoan>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchItem = async () => {
    try {
      const loanRes = await fetchLoan(vault, collection, loanId);
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
  };

  const pollFn = useInterval(fetchItem, 5000);

  const initialFetch = async () => {
    setIsLoading(true);
    await fetchItem();
    setIsLoading(false);
  };

  useEffect(() => {
    initialFetch();
    pollFn.start();
    return pollFn.stop;
  }, []);

  return { loan, isLoading } as const;
};
