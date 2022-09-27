import { COINGECKO_BASE_URL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

interface PriceData {
  latestPrice: number;
  history: Record<number, number>;
}

interface PriceHistory {
  prices: Array<[number, number]>;
}

const DEFAULT_PRICE_DATA: PriceData = {
  history: {},
  latestPrice: 0,
};

export const fetchPriceData = async (coinId: string) => {
  const response = await fetch(
    `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=365&interval=daily`
  );
  const history = await response.json();

  return parsePriceData(history);
};

const parsePriceData = (history: PriceHistory): PriceData => {
  const { prices } = history;
  const [latest] = prices.slice(-1);

  const past = prices.slice(0, -1).reduce((acc, [t, p]) => {
    return { ...acc, [t]: p };
  }, {});

  return {
    latestPrice: latest[1],
    history: past,
  };
};

export const useCoinPrice = (coinId: string): [PriceData, boolean] => {
  const [data, setData] = useState(DEFAULT_PRICE_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPriceData(coinId).then((data: PriceData) => {
      setData(data);
    });
    setLoading(false);
  }, [coinId]);

  return [data, loading];
};

export const usdValue = (amount: BigNumber, priceInUSD: number, dp = 2) => {
  if (amount.isZero()) {
    return '0';
  }

  const bnPrice = new BigNumber(priceInUSD);
  const usdValue = amount
    .multipliedBy(bnPrice)
    .toFixed(dp, BigNumber.ROUND_HALF_DOWN);
  return usdValue;
};

export const useUsdValueOfEth = (amount: BigNumber) => {
  const [ethPrice, ethPriceLoading] = useCoinPrice('ethereum');
  const usdAmount = usdValue(amount, ethPrice.latestPrice);
  return [usdAmount, ethPriceLoading] as const;
};
