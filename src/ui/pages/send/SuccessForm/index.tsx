import { TOKEN } from '@components/moleculas/CurrencySelector';
import { Group, Image, Stack, TextInput } from '@mantine/core';
import { ReactComponent as WethSvg } from 'assets/img/weth.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import * as React from 'react';
import Text from '@components/Text';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import { ArrowUpRight } from 'tabler-icons-react';
import { CollectionAsset } from 'types';
import { SentAssetType, TransferType } from '..';
import { getTxExplorerLink } from '@utils/env';
import Button from '@components/Button';
import styles from './index.module.scss';

const NftSuccessForm: React.FC<{
  nft: CollectionAsset;
  recipient: string;
}> = ({ nft, recipient }) => {
  return (
    <Stack>
      <Group
        py={6}
        px={8}
        spacing={0}
        sx={{
          borderRadius: 10,
          background: 'rgba(27, 29, 44, 0.6)',
          ':hover': { cursor: 'pointer' },
        }}
        align="center"
      >
        <Image
          width={38}
          height={38}
          fit="contain"
          radius={10}
          src={nft?.image || PepePlacholderImg}
          alt="image"
        />
        <Stack spacing={0} ml={8}>
          <Text weight="bold">{nft.name || `#${nft.tokenId}`}</Text>
          <Text type="secondary" size="sm">
            {nft.collection.name}
          </Text>
        </Stack>
      </Group>
      <TextInput
        size="md"
        value={recipient}
        className={styles.input}
        readOnly
      />
    </Stack>
  );
};

const TokenSuccessForm: React.FC<{
  token: TOKEN;
  recipient: string;
  amount: string;
}> = ({ token, recipient, amount }) => {
  return (
    <Stack>
      <Group
        py={6}
        px={8}
        spacing={0}
        sx={{
          borderRadius: 10,
          background: 'rgba(27, 29, 44, 0.6)',
          ':hover': { cursor: 'pointer' },
        }}
        align="center"
      >
        {token == TOKEN.ETH ? <EthSvg /> : <WethSvg />}
        <Stack spacing={0} ml={8}>
          <Text weight="bold">
            {token == TOKEN.ETH ? 'Ethereum' : 'Wrapped Ethereum'}
          </Text>
        </Stack>
      </Group>
      <TextInput
        className={styles.input}
        size="md"
        value={recipient}
        readOnly
      />
      <TextInput
        className={styles.input}
        type="number"
        rightSection={
          <Text type="gradient" weight="bold">
            {token == TOKEN.WETH ? 'wETH' : 'ETH'}
          </Text>
        }
        readOnly
        size="md"
        value={amount}
      />
    </Stack>
  );
};

const SuccessForm: React.FunctionComponent<{
  asset: SentAssetType;
  onClose: () => void;
}> = ({ asset, onClose }) => {
  return (
    <Stack pb={60}>
      {asset.type == TransferType.TOKEN ? (
        <TokenSuccessForm
          token={asset.value as TOKEN}
          recipient={asset.recipient}
          amount={asset.amount!}
        />
      ) : (
        <NftSuccessForm
          nft={asset.value as CollectionAsset}
          recipient={asset.recipient}
        />
      )}
      <Button
        fullWidth
        mt={12}
        onClick={() => window.open(getTxExplorerLink(asset.txHash), '_blank')}
      >
        View Send Txn <ArrowUpRight size={16} />
      </Button>
      <Button fullWidth kind="secondary" mt={12} onClick={onClose}>
        Close
      </Button>
    </Stack>
  );
};

export default SuccessForm;
