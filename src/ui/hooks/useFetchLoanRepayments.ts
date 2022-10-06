import { useQuery } from '@apollo/client';
import { GET_LOAN_REPAYMENTS } from 'graphql/queries/repayments';

export const useFetchLoanRepayments = (
  vaultAddress: string,
  loanId: number
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
  });

  return {
    data,
    loading,
    error,
    refetch,
  };
};
