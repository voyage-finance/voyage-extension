import Link from '@components/Link';
import Text from '@components/Text';
import { Stack } from '@mantine/core';
import { getShortenedAddress, getTxExplorerLink } from '@utils/env';
import * as React from 'react';
import { GsnTxState } from 'types/transaction';

interface ITxStatusTextProps {
  txHash: string;
  txState: GsnTxState;
}

const TxStatusText: React.FunctionComponent<ITxStatusTextProps> = ({
  txHash,
  txState,
}) => {
  return (
    <Stack align="center" spacing={0}>
      {(txState == GsnTxState.Mined || txState == GsnTxState.Initialized) && (
        <Text type={txState == GsnTxState.Mined ? 'success' : 'primary'}>
          {txState == GsnTxState.Mined
            ? 'Transaction is successfully sent'
            : 'Transaction initialized'}
        </Text>
      )}
      <Link
        link={getTxExplorerLink(txHash)}
        text={getShortenedAddress(txHash)}
      />
    </Stack>
  );
};

export default TxStatusText;
