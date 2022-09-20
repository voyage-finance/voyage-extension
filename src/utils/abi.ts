import { Contracts } from '@utils/env';
import { ContractInterface } from 'ethers';
import VoyageABI from 'abis/voyage.json';
import LooksrareABI from 'abis/looksrare.json';
import SeaportABI from 'abis/seaport.json';
import VoyagePaymasterABI from 'abis/paymaster.json';

export const ABIs: Record<Contracts, ContractInterface> = {
  [Contracts.Voyage]: VoyageABI,
  [Contracts.LooksRare]: LooksrareABI,
  [Contracts.Seaport]: SeaportABI,
  [Contracts.Paymaster]: VoyagePaymasterABI,
};
