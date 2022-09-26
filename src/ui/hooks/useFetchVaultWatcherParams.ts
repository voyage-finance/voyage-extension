import { formatEthersBN } from '@utils/bn';
import { fetchGasFees, fetchVaultGas } from 'api';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TxSpeed } from 'types';

export const useFetchVaultWatcherParams = () => {
  const [minAmount, setMinAmount] = useState(ethers.constants.Zero);
  const [maxFeePerGas, setMaxFeePerGas] = useState(ethers.constants.Zero);
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
    ethers.constants.Zero
  );
  const [loading, setLoading] = useState(false);

  const calculateMin = async () => {
    setLoading(true);
    try {
      const gasFees = await fetchGasFees();
      const vaultGas = BigNumber.from(await fetchVaultGas());
      const _maxPriorityFeePerGas = ethers.utils.parseUnits(
        gasFees[TxSpeed.NORMAL].suggestedMaxPriorityFeePerGas,
        'gwei'
      );
      const _maxFeePerGas = ethers.utils.parseUnits(
        gasFees[TxSpeed.NORMAL].suggestedMaxFeePerGas,
        'gwei'
      );

      setMinAmount(
        vaultGas.mul(_maxPriorityFeePerGas.add(_maxFeePerGas)).mul(2)
      );
      setMaxPriorityFeePerGas(_maxPriorityFeePerGas);
      setMaxFeePerGas(_maxFeePerGas);
    } catch (e) {
      console.error('Failed at useMinDepositAmount', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    calculateMin();
  }, []);

  return [
    formatEthersBN(minAmount),
    maxFeePerGas,
    maxPriorityFeePerGas,
    loading,
  ] as const;
};
