import { useQuery } from '@apollo/client';
import { GET_RESERVES } from 'graphql/queries/reserves';

export const useReserves = () => {
  const { loading, data, error, refetch } = useQuery<{
    reserves: {
      id: string;
      collection: string;
      currency: {
        id: string;
      };
    }[];
  }>(GET_RESERVES);

  return {
    data,
    loading: loading,
    error,
    refetch,
  };
};
