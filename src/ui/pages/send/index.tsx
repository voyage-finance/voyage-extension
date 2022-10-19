import TitleWithLine from '@components/atoms/TitleWithLine';
import { SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import styles from './index.module.scss';
import NFTForm from './NFTForm';

enum TransferType {
  TOKEN = 'Token',
  NFT = 'NFT',
}

const SendPage: React.FunctionComponent = () => {
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
          styles={{
            root: {
              backgroundColor: 'rgba(27, 29, 44, 0.6)',
              borderRadius: 10,
              padding: '5px, 6px',
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
        <NFTForm />
      </Stack>
    </div>
  );
};

export default SendPage;
