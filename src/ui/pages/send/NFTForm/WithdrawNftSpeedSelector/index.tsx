import { BoxProps } from '@mantine/core';
import * as React from 'react';
import useVoyageController from '@hooks/useVoyageController';
import { CollectionAsset, TxSpeed } from 'types';
import SpeedSelect from '@components/moleculas/SpeedSelect';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: TxSpeed;
  vault?: string;
  defaultNft: CollectionAsset;
  onChange: (opt: TxSpeed) => void;
}

const SendTokenSpeedSelector: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  vault,
  defaultNft,
  ...props
}) => {
  const controller = useVoyageController();

  const rawTx = controller.populateWithdrawNft(
    vault!,
    defaultNft.collection.id,
    defaultNft.tokenId,
    '0x7bB17c9401110D05ec39894334cC9d7721E90688'
  );

  return (
    <SpeedSelect value={value} onChange={onChange} rawTx={rawTx} {...props} />
  );
};

export default SendTokenSpeedSelector;
