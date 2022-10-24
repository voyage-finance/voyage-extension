import TitleWithLine from '@components/atoms/TitleWithLine';
import { TOKEN } from '@components/moleculas/CurrencySelector';
import { SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import { CollectionAsset } from 'types';
import styles from './index.module.scss';
import NFTForm from './NFTForm';
import SuccessForm from './SuccessForm';
import TokenForm from './TokenForm';

export enum TransferType {
  TOKEN = 'Token',
  NFT = 'NFT',
}

export type SentAssetType = {
  type: TransferType;
  value: TOKEN | CollectionAsset;
  recipient: string;
  amount?: string;
  txHash: string;
};

const SendPage: React.FunctionComponent = () => {
  const [currentTab, setCurrentTab] = React.useState<TransferType>(
    TransferType.TOKEN
  );
  const [sentAsset, setSentAsset] = React.useState<SentAssetType>();

  return (
    <div className={styles.wrapper}>
      <Stack className={styles.root}>
        <TitleWithLine
          showClose
          onClose={
            sentAsset
              ? () => {
                  setSentAsset(undefined);
                }
              : undefined
          }
        >
          Send
        </TitleWithLine>
        {!sentAsset && (
          <SegmentedControl
            data={[
              { label: TransferType.TOKEN, value: TransferType.TOKEN },
              { label: TransferType.NFT, value: TransferType.NFT },
            ]}
            color="black"
            value={currentTab}
            onChange={(value) => setCurrentTab(value as TransferType)}
            styles={{
              root: {
                backgroundColor: 'rgba(27, 29, 44, 0.6)',
                borderRadius: 10,
                padding: '5px, 6px',
                flexShrink: 0,
              },
              label: {
                fontWeight: 700,
                fontSize: 14,
                color: 'white',
              },
              labelActive: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 5,
              },
            }}
          />
        )}
        {sentAsset ? (
          <SuccessForm
            asset={sentAsset}
            onClose={() => setSentAsset(undefined)}
          />
        ) : currentTab == TransferType.NFT ? (
          <NFTForm
            onSent={(value, recipient, txHash) =>
              setSentAsset({
                type: TransferType.NFT,
                value,
                recipient,
                txHash,
              })
            }
          />
        ) : (
          <TokenForm
            onSent={(value, recipient, amount, txHash) =>
              setSentAsset({
                type: TransferType.TOKEN,
                value,
                recipient,
                amount,
                txHash,
              })
            }
          />
        )}
      </Stack>
    </div>
  );
};

export default SendPage;
