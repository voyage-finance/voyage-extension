import { fetchAssets } from 'api';
import { useEffect, useState } from 'react';
import { CollectionAsset } from 'types';
import { useAppSelector } from './useRedux';

export const useFetchMyAssets = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [assets, setAssets] = useState<CollectionAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = async () => {
    if (!vaultAddress) return;
    setIsLoading(true);
    try {
      const collectionAssetsMap = await fetchAssets(vaultAddress);
      Object.keys(collectionAssetsMap).map((collection) =>
        setAssets([...assets, ...collectionAssetsMap[collection]])
      );
    } catch (e) {
      console.error('[useFetchMyAssets]', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [vaultAddress]);

  return [assets, isLoading] as const;
};
