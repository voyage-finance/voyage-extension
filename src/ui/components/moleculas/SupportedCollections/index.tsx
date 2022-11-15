import * as React from 'react';
import VoyagePaper from '@components/Card';
import { Group, Loader, Stack, Title } from '@mantine/core';
import { ReactComponent as LookrareIcon } from 'assets/img/looksrare-icon.svg';
import { ReactComponent as OpenseaIcon } from 'assets/img/opensea-icon.svg';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import styles from './index.module.scss';
import Text from '@components/Text';
import { useReserves } from '@hooks/useReserves';
import { useCollectionMetadata } from '@hooks/useCollectionMetadata';
import { useTwap } from '@hooks/useTwap';
import { formatAmount } from '@utils/bn';
import BigNumber from 'bignumber.js';

const CollectionCard: React.FC<{ collection: string }> = ({ collection }) => {
  const [data, loading] = useCollectionMetadata(collection);
  const [twap] = useTwap(collection);

  const handleMarketplaceClick = (link: string) => window.open(link, '_blank');

  return (
    <VoyagePaper className={styles.collection}>
      <img src={data?.image || PepePlacholderImg} className={styles.logo} />
      <Stack spacing={0} ml={12}>
        <Text size="lg" weight={'bold'}>
          {loading ? '...' : data?.name}
        </Text>
        <Text size="sm">
          Floor: {twap ? formatAmount(new BigNumber(twap)) : '-'} ETH
        </Text>
      </Stack>
      <Group spacing={6} ml="auto">
        <LookrareIcon
          className={styles.marketplaceLogo}
          onClick={() =>
            handleMarketplaceClick(
              `https://looksrare.org/collections/${collection}`
            )
          }
        />
        <OpenseaIcon
          className={styles.marketplaceLogo}
          onClick={() =>
            handleMarketplaceClick(
              `https://opensea.io/assets/ethereum/${collection}/1`
            )
          }
        />
      </Group>
    </VoyagePaper>
  );
};

const SupportedCollections: React.FunctionComponent = () => {
  const { data: reservesResult, loading } = useReserves();

  return (
    <Stack>
      <Title order={3} mt={30} sx={{ color: 'white' }}>
        Supported Collections
      </Title>
      {loading && <Loader mx="auto" />}
      {reservesResult?.reserves.map((reserve) => (
        <CollectionCard collection={reserve.collection} />
      ))}
    </Stack>
  );
};

export default SupportedCollections;
