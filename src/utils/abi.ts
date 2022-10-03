import { ContractInterface } from 'ethers';
import VoyageABI from 'abis/voyage.json';
import LooksrareABI from 'abis/looksrare.json';
import SeaportABI from 'abis/seaport.json';
import VoyagePaymasterABI from 'abis/paymaster.json';
import { VoyageContract } from './constants';

export const ABIs: Record<VoyageContract, ContractInterface> = {
  [VoyageContract.Voyage]: VoyageABI,
  [VoyageContract.LooksRare]: LooksrareABI,
  [VoyageContract.Seaport]: SeaportABI,
  [VoyageContract.Paymaster]: VoyagePaymasterABI,
};
