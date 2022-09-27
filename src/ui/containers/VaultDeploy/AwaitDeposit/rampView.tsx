import Text from '@components/Text';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
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
      setRampSdk(
        new RampInstantSDK({
          fiatCurrency: 'USD',
          fiatValue: fiatValue.toString(),
          userAddress: vaultAddress,
          hostAppName: 'Voyage Finance',
          hostLogoUrl:
            'https://www.gitbook.com/cdn-cgi/image/height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F2911427920-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FwTJiNiflWAHIit0v2fTN%252Flogo%252FjDYi6XKDJt97vfV8UyUv%252Flogo-voyage-whitepaper.png%3Falt%3Dmedia%26token%3D18219a2f-32e5-4b6d-b1c7-54267f0f881e',
          hostApiKey: '2zzk5n625k5oe4aftrh28yuucwezquh87ugmy5q5',
          variant: 'hosted-desktop',
          defaultAsset: 'ETH',
          swapAmount: '1',
        })
      );
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
