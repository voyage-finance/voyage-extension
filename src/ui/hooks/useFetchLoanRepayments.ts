import { useQuery } from '@apollo/client';
import { GET_LOAN_REPAYMENTS } from 'graphql/queries/repayments';

export const useFetchLoanRepayments = (
  vaultAddress: string,
  loanId: number,
  polling?: boolean
) => {
  const { loading, data, error, refetch } = useQuery<{
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
    fetchPolicy: 'no-cache',
    pollInterval: polling ? 5000 : 0,
  });

  return {
    data,
    loading: loading,
    error,
    refetch,
  };
};
