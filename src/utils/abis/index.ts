import { LooksRareExchangeAbi } from '@looksrare/sdk';
import { Contracts } from '@utils/env';
import { ContractInterface } from 'ethers';

export const ABIs: Record<Contracts, ContractInterface> = {
  [Contracts.Voyage]: [],
  [Contracts.LooksRare]: LooksRareExchangeAbi,
  [Contracts.Seaport]: [],
};
