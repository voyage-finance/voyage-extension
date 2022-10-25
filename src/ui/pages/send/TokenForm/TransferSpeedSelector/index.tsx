import { BoxProps } from '@mantine/core';
import * as React from 'react';
import useVoyageController from '@hooks/useVoyageController';
import { TxSpeed } from 'types';
import SpeedSelect from '@components/moleculas/SpeedSelect';
import { TOKEN } from '@components/moleculas/CurrencySelector';
import { ethers } from 'ethers';
import { WETH_ADDRESS } from '@utils/constants';
import { getChainID } from '@utils/env';

interface ISpeedSelectProps extends Omit<BoxProps<'div'>, 'onChange'> {
  value: TxSpeed;
  vault?: string;
  type: TOKEN;
  onChange: (opt: TxSpeed) => void;
}

const TransferSpeedSelector: React.FunctionComponent<ISpeedSelectProps> = ({
  value,
  onChange,
  vault,
  type,
  ...props
}) => {
  const controller = useVoyageController();

  const rawTx =
    type == TOKEN.ETH
      ? controller.populateTransferETH(
          vault!,
          ethers.constants.AddressZero,
          '0'
        )
      : controller.populateTransferCurrency(
          vault!,
          WETH_ADDRESS[getChainID()],
          ethers.constants.AddressZero,
          '0'
        );

  return (
    <SpeedSelect value={value} onChange={onChange} rawTx={rawTx} {...props} />
  );
};

export default TransferSpeedSelector;
