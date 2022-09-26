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
