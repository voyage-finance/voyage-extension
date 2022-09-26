import { useInterval } from '@mantine/hooks';
import { fetchGasFees } from 'api';
import { useEffect, useState } from 'react';
import { SpeedConfig, TxSpeed } from 'types';

const DEFAULT_SPEEDS: Record<string, SpeedConfig> = {
  [TxSpeed.FAST]: {
    type: TxSpeed.FAST,
    label: '🚤 Fast',
  },
  [TxSpeed.NORMAL]: {
    type: TxSpeed.NORMAL,
    label: '⛵ Normal',
  },
  [TxSpeed.SLOW]: {
    type: TxSpeed.SLOW,
    label: '🛶 Slow',
  },
};

export const useGasSpeeds = () => {
  const [isFeeLoading, setFeeLoading] = useState(false);
  const [speeds, setSpeeds] =
    useState<Record<string, SpeedConfig>>(DEFAULT_SPEEDS);

  const updateGasFees = async () => {
    setFeeLoading(true);
    try {
      const body = await fetchGasFees();
      const newSpeedValues = speeds;
      Object.keys(body).forEach((key) => {
        if (newSpeedValues[key])
          newSpeedValues[key].values = {
            maxFeePerGas: body[key].suggestedMaxPriorityFeePerGas,
            maxWaitTime: body[key].maxWaitTimeEstimate / 1000,
          };
      });
      setSpeeds(newSpeedValues);
    } catch (e) {
      console.error('Failed [updateGasFees]', e);
    }
    setTimeout(() => {
      setFeeLoading(false);
    }, 2000);
  };

  const getFeesPoll = useInterval(updateGasFees, 5000);

  useEffect(() => {
    getFeesPoll.start();
    return getFeesPoll.stop;
  }, []);

  return [speeds, isFeeLoading] as const;
};
