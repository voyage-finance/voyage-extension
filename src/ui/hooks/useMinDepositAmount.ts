import { formatEthersBN } from '@utils/bn';
import { fetchGasFees, fetchVaultGas } from 'api';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TxSpeed } from 'types';

export const useMinDepositAmount = () => {
  const [minAmount, setMinAmount] = useState(ethers.constants.Zero);
  const [loading, setLoading] = useState(false);

  const calculateMin = async () => {
    setLoading(true);
    try {
      const gasFees = await fetchGasFees();
      const vaultGas = BigNumber.from(await fetchVaultGas());
      const maxPriorityFeePerGas = ethers.utils.parseUnits(
        gasFees[TxSpeed.NORMAL].suggestedMaxPriorityFeePerGas,
        'gwei'
      );
      const maxFeePerGas = ethers.utils.parseUnits(
        gasFees[TxSpeed.NORMAL].suggestedMaxFeePerGas,
        'gwei'
      );

      setMinAmount(vaultGas.mul(maxPriorityFeePerGas.add(maxFeePerGas)).mul(2));
    } catch (e) {
      console.error('Failed at useMinDepositAmount', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    calculateMin();
  }, []);

  return [formatEthersBN(minAmount), loading] as const;
};
