import { gql } from '@apollo/client';

export const GET_LOAN_REPAYMENTS = gql`
  query getLoanRepayments($id: Bytes) {
    loan(id: $id) {
      id
      repayments {
        id
        paidAt
        txHash
      }
    }
  }
`;
