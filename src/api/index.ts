import { ILoan } from 'types';

export const fetchGasFees = async () => {
  const estimateGasResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/gasFee`
  );
  return await estimateGasResponse.json();
};

export const fetchVaultGas = async () => {
  const estimateGasResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/vaultGas`
  );
  const body = await estimateGasResponse.json();

  return body.CREATE_VAULT_GAS_LIMIT;
};

export const fetchLoanList = async (vault: string) => {
  const loanListResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/loans`,
    {
      method: 'POST',
      body: JSON.stringify({
        vault,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const loans = await loanListResponse.json();

  return loans as ILoan[];
};

export const fetchLoan = async (id: string) => {
  const loanListResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/loans/${id}`
  );
  const loan = await loanListResponse.json();

  return loan as ILoan;
};
