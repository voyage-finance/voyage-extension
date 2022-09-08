import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

export enum TransactionStatus {
  Initial, // when just received from middleware
  Unconfirmed, // yet to be confirmed by the user
  Pending, // confirmed and broadcasted to the mempool but not mined yet, has tx hash
  Mined, // mined on the blockchain, has a transaction hash
  Rejected, // rejected by user
}

export type TransactionParams = ethers.UnsignedTransaction;

export interface Transaction {
  id: string; // randomly generated id
  hash?: string;
  status: TransactionStatus;
  options: TransactionParams; // the standard params such as gas, etc
  orderPreview?: OrderPreview; // used to store marketplace-specific data
  result?: RelayingResult; // only set when the tx is in Pending or Mined state
}

export interface OrderPreview {
  loanParameters: {
    vault: string; // address of the borrowing vault
    term: string; // loan duration
    epoch: string; // instalment interval
    nper: string; // total number of instalments
    borrowRate: BigNumber; // the interest rate on the loan, aka our fees [RAY] 10^27 decimals shift
    loanId: string;
    payment: {
      principal: BigNumber;
      interest: BigNumber;
      pmt: BigNumber;
    };
  };
  metadata: Metadata;
  gasPrice: string;
  // Waiting time(in seconds) for gas price speed
  waitTime: number;
  // the result of eth_estimateGas
  gasLimit: string;
  price: BigNumber;
}

export interface Metadata {
  tokenType: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes: any[];
  collectionName: string;
  collectionAddress: string;
}

export type RelayingResult = unknown;
