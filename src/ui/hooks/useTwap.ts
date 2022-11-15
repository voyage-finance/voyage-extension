import { useInterval } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { getTwap } from 'api';

export const useTwap = (collection: string) => {
  const [isLoading, setLoading] = useState(false);

  const [twap, setTwap] = useState<any>();

  const fetchTwap = async () => {
    setLoading(true);
    try {
      setTwap((await getTwap(collection)).price);
    } catch (e) {
      console.error('Failed [fetchTwap]', e);
    }
    setLoading(false);
  };

  const fetchTwapPoll = useInterval(fetchTwap, 601000);

  useEffect(() => {
    fetchTwap();
    fetchTwapPoll.start();
    return fetchTwapPoll.stop;
  }, []);

  return [twap, isLoading] as const;
};
