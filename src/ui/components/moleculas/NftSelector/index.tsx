import Text from '@components/Text';
import {
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Stack,
  TextInput,
} from '@mantine/core';
import * as React from 'react';
import { ChevronDown, Search } from 'tabler-icons-react';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import styles from './index.module.scss';
import { ReactComponent as CheckOrangeSvg } from 'assets/img/check-orange.svg';
import { useFetchMyAssets } from '@hooks/useFetchMyAssets';
import { CollectionAsset } from 'types';

const NftSelector: React.FunctionComponent<{
  value?: CollectionAsset;
  onChange: (value: CollectionAsset) => void;
  onListFetched: (assets: CollectionAsset[]) => void;
}> = ({ value, onChange, onListFetched }) => {
  const [assets, isLoading] = useFetchMyAssets();
  const [searchText, setSearchText] = React.useState('');

  const [filteredAssets, setFilteredAssets] = React.useState<CollectionAsset[]>(
    []
  );

  React.useEffect(() => {
    setFilteredAssets(
      assets.filter(
        (asset) =>
          asset.closed &&
          (asset.name?.toLowerCase().includes(searchText) ||
            asset.collection.name.toLowerCase().includes(searchText) ||
            asset.tokenId.includes(searchText))
      )
    );
  }, [assets, searchText]);

  React.useEffect(() => {
    onListFetched(assets.filter((asset) => asset.closed));
  }, [assets]);

  return (
    <Menu
      shadow="md"
      control={
        <Group
          py={6}
          px={8}
          spacing={0}
          sx={{
            borderRadius: 10,
            background: 'rgba(27, 29, 44, 0.6)',
            ':hover': { cursor: 'pointer' },
          }}
        >
          <Image
            width={38}
            height={38}
            fit="contain"
            radius={10}
            src={value?.image || PepePlacholderImg}
            alt="image"
          />
          <Stack spacing={0} ml={8}>
            <Text weight="bold">
              {value ? value.name || `#${value.tokenId}` : 'Select NFT'}
            </Text>
            <Text type="secondary" size="sm">
              {value ? value.collection.name : '–'}
            </Text>
          </Stack>
          <ChevronDown style={{ marginTop: 1, marginLeft: 'auto' }} size={18} />
        </Group>
      }
      position="bottom"
      placement="end"
      styles={{
        body: {
          width: 306,
          height: 352,
          borderRadius: 10,
          background: '#242940',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 10,
          overflowY: 'scroll',
          position: 'relative',
        },
        item: {
          borderRadius: 10,
          padding: '6px 8px',
        },
        itemLabel: {
          display: 'flex',
        },
        itemHovered: {
          background: 'rgba(27, 29, 44, 0.6)',
        },
      }}
    >
      <TextInput
        placeholder="Search NFT"
        className={styles.searchBox}
        value={searchText}
        onChange={(event) => setSearchText(event.currentTarget.value)}
        size="md"
        icon={<Search size={15} />}
      />
      <Group direction="column" spacing={6} pt={45}>
        <LoadingOverlay visible={isLoading} />
        {assets.length == 0 && !isLoading && (
          <Text my="auto" align="center" mt={12}>
            You do not hold any NFTs.
          </Text>
        )}
        {filteredAssets.map((asset, i) => (
          <Menu.Item
            key={i}
            onClick={() => onChange(asset)}
            rightSection={value == asset ? <CheckOrangeSvg /> : undefined}
          >
            <Image
              width={38}
              height={38}
              fit="contain"
              radius={10}
              src={asset.image || PepePlacholderImg}
              alt="image"
            />
            <Stack spacing={0} ml={8}>
              <Text weight="bold">{asset.name || `#${asset.tokenId}`}</Text>
              <Text type="secondary" size="sm">
                {asset.collection.name}
              </Text>
            </Stack>
          </Menu.Item>
        ))}
      </Group>
    </Menu>
  );
};

export default NftSelector;
