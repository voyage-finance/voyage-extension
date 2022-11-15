import { gql } from '@apollo/client';

export const GET_RESERVES = gql`
  query getReserves {
    reserves {
      id
      collection
      currency {
        id
      }
    }
  }
`;
