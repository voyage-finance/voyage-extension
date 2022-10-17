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
      let _assets: CollectionAsset[] = [];
      const collectionAssetsMap = await fetchAssets(vaultAddress);
      Object.keys(collectionAssetsMap).map(
        (collection) =>
          (_assets = [..._assets, ...collectionAssetsMap[collection]])
      );
      setAssets(_assets);
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
