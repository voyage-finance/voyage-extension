import { useEffect, useState } from 'react';

export const useCollectionMetadata = (collection: string) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ name: string; image?: string }>();

  const fetchMetadata = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.VOYAGE_API_URL}/v1/metadata/collection/${collection}`
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error('Failed to fetch metadata: ', data);
    }
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  return [data, loading] as const;
};
