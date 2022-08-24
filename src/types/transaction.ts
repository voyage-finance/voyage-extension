import { ethers } from 'ethers';

export enum TransactionStatus {
  Unconfirmed, // yet to be confirmed by the user
  Pending, // confirmed and broadcasted to the mempool but not mined yet, has tx hash
  Mined, // mined on the blockchain, has a transaction hash
  Rejected, // rejected by user
}

export type TransactionParams = ethers.UnsignedTransaction;

export interface Transaction {
  id: string; // randomly generated id
  status: TransactionStatus;
  options: TransactionParams; // the standard params such as gas, etc
  metadata?: any; // used to store marketplace-specific data
  result?: RelayingResult; // only set when the tx is in Pending or Mined state
}
// TODO
export type RelayingResult = {};
