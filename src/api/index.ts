export const fetchGasFees = async () => {
  const estimateGasResponse = await fetch(
    `${process.env.VOYAGE_API_URL}/v1/metadata/gasFee`
  );
  return await estimateGasResponse.json();
};

export const fetchVaultGas = async () => {
  return 515000;
};
