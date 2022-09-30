import Text from '@components/Text';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { initRamp } from '@utils/ramp';
import * as React from 'react';

interface IRampViewProps {
  usdValue: string;
  vaultAddress: string;
  isLoading?: boolean;
}

const MIN_RAMP_DEPOSIT = 22;

const RampView: React.FunctionComponent<IRampViewProps> = ({
  usdValue,
  vaultAddress,
  isLoading,
}) => {
  const [rampSdk, setRampSdk] = React.useState<RampInstantSDK>();

  const navigateToRamp = () => {
    rampSdk?.show();
  };

  React.useEffect(() => {
    if (vaultAddress && usdValue) {
      const fiatValue = Math.max(MIN_RAMP_DEPOSIT, Number(usdValue));
      setRampSdk(initRamp(vaultAddress, fiatValue));
    }
  }, [vaultAddress, usdValue]);

  React.useEffect(() => {
    if (rampSdk) navigateToRamp();
  }, [rampSdk]);

  return isLoading ? (
    <Text>Loading...</Text>
  ) : (
    <Text align="center" size="lg">
      You should be now navigate to Ramp page to make your payment.
      <br />
      If not click{' '}
      <Text
        weight="bold"
        underline
        component="a"
        onClick={navigateToRamp}
        sx={{ ':hover': { cursor: 'pointer' } }}
      >
        here
      </Text>
    </Text>
  );
};

export default RampView;
