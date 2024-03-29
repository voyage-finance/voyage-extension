import styles from './index.module.scss';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import { ReactComponent as LockSvg } from '@images/lock.svg';
import { Image, LoadingOverlay, Stack } from '@mantine/core';
import Text from '@components/Text';
import { useFetchMyAssets } from '@hooks/useFetchMyAssets';
import TitleWithLine from '@components/atoms/TitleWithLine';

const CollectionsPage: React.FunctionComponent = () => {
  const [assets, isLoading] = useFetchMyAssets();

  return (
    <div className={styles.wrapper}>
      <div className={styles.root}>
        <TitleWithLine>Collections</TitleWithLine>
        <LoadingOverlay visible={isLoading} />
        {assets.length == 0 && (
          <Text size="sm" my="auto" align="center">
            You do not hold any NFTs.
          </Text>
        )}
        <div className={styles.grid}>
          {assets.map((asset) => (
            <Stack className={styles.card} key={asset.tokenId} spacing={5}>
              <div className={styles.imageContainer}>
                <Image
                  width={145}
                  height={145}
                  mx="auto"
                  fit="contain"
                  radius={10}
                  src={asset.image || PepePlacholderImg}
                  alt="image"
                  sx={{ position: 'relative' }}
                />
                {!asset.closed && <LockSvg className={styles.lock} />}
              </div>
              <Text weight="bold" className={styles.title}>
                {asset.name || `#${asset.tokenId}`}
              </Text>
            </Stack>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
