import { BoxProps } from '@mantine/core';
import * as React from 'react';
import useVoyageController from '@hooks/useVoyageController';
import { useAppSelector } from '@hooks/useRedux';
import { decodeMarketplaceCalldata } from '@utils/decoder';
import { useParams } from 'react-router-dom';
import { TxSpeed } from 'types';
import SpeedSelect from '@components/moleculas/SpeedSelect';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: TxSpeed;
  vault?: string;
  onChange: (opt: TxSpeed) => void;
}

const BuyNowSpeedSelect: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  vault,
  ...props
}) => {
  const { txId } = useParams();
  const controller = useVoyageController();
  const transaction = useAppSelector((state) => {
    return state.core.transactions[txId!];
  });

  const { marketplace, tokenId, collection, data } = decodeMarketplaceCalldata(
    transaction.options
  );

  const rawTx = controller.populateBuyNow(
    collection,
    tokenId.toString(),
    vault!,
    marketplace,
    data
  );

  return (
    <SpeedSelect value={value} onChange={onChange} rawTx={rawTx} {...props} />
  );
};

export default BuyNowSpeedSelect;
