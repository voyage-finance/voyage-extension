import TitleWithLine from '@components/atoms/TitleWithLine';
import { SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import styles from './index.module.scss';
import NFTForm from './NFTForm';
import TokenForm from './TokenForm';

enum TransferType {
  TOKEN = 'Token',
  NFT = 'NFT',
}

const SendPage: React.FunctionComponent = () => {
  const [currentTab, setCurrentTab] = React.useState(TransferType.TOKEN);
  return (
    <div className={styles.wrapper}>
      <Stack className={styles.root}>
        <TitleWithLine>Send</TitleWithLine>
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
        {currentTab == TransferType.NFT && <NFTForm />}
        {currentTab == TransferType.TOKEN && <TokenForm />}
      </Stack>
    </div>
  );
};

export default SendPage;
