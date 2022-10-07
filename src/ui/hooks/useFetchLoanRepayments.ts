import { NetworkStatus, useQuery } from '@apollo/client';
import { GET_LOAN_REPAYMENTS } from 'graphql/queries/repayments';

export const useFetchLoanRepayments = (
  vaultAddress: string,
  loanId: number
) => {
  const { loading, data, error, networkStatus, refetch } = useQuery<{
    loan?: {
      repayments?: {
        id: string;
        txHash: string;
        paidAt: string;
      }[];
    };
  }>(GET_LOAN_REPAYMENTS, {
    variables: {
      id: `${vaultAddress!.toLowerCase()}_${loanId}`,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
  });

  return {
    data,
    loading: loading || networkStatus === NetworkStatus.refetch,
    error,
    refetch,
  };
};
