import { RelayTransactionRequest } from '@opengsn/common/dist/types/RelayTransactionRequest';
import { CollectionAssets, ILoan } from 'types';

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

export const fetchLoan = async (
  vault: string,
  collection: string,
  loanId: string
) => {
  const loanListResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/loans/retrieve`,
    {
      method: 'POST',
      body: JSON.stringify({
        vault, //: `${vault.toLowerCase()}_${collection.toLowerCase()}`,
        collection,
        loanId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const loan = await loanListResponse.json();

  return loan as ILoan;
};

export const fetchAssets = async (vault: string) => {
  const loanListResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/vault/${vault}/assets`
  );
  const assets = await loanListResponse.json();

  return assets as CollectionAssets;
};

export const fetchEstimatedGas = async (relayedTx: RelayTransactionRequest) => {
  const estimateGasResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/estimateGas`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        speed: 'fast', // will be removed for next version of api
        request: relayedTx,
      }),
    }
  );
  const body = await estimateGasResponse.json();
  return body.gas;
};
