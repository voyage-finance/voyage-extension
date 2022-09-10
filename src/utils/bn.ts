import BigNumber from 'bignumber.js';
import { BigNumber as EthersBN } from 'ethers';

export const shiftDecimals = (bn: BigNumber, decimals: number) => {
  BigNumber.config({ DECIMAL_PLACES: decimals });
  return new BigNumber(bn.toString()).dividedBy(
    new BigNumber(10).pow(decimals)
  );
};

export const formatEthersBN = (bn: any, decimals = ETHERS_DECIMALS) => {
  const n = new BigNumber(EthersBN.from(bn).toString());
  return n.shiftedBy(decimals * -1);
};

export const fromBigNumber = (bn: any) => new BigNumber(bn.toString());

export const formatAmount = (value: BigNumber = Zero, decimalPlaces = 5) => {
  const leadingZeros = value.isZero()
    ? 0
    : Math.floor(Math.abs(Math.log10(value?.toNumber())));
  return parseFloat(value.toFixed(Math.max(leadingZeros + 1, decimalPlaces)));
};

export const Zero = new BigNumber(0);
// TODO: make it dynamic
export const ETHERS_DECIMALS = 18;
export const MIN_DEPOSIT = new BigNumber(0.005);
