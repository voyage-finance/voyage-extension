import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import LogoUrl from '@images/icon.png';

export const initRamp = (userAddress: string, amount = 1000) =>
  new RampInstantSDK({
    fiatCurrency: 'USD',
    fiatValue: amount.toString(),
    userAddress,
    hostAppName: 'Voyage Finance',
    hostLogoUrl: LogoUrl,
    hostApiKey: '2zzk5n625k5oe4aftrh28yuucwezquh87ugmy5q5',
    variant: 'hosted-desktop',
    defaultAsset: 'ETH',
    swapAmount: '1',
  });
