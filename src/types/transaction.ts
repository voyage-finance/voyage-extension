import BigNumber from 'bignumber.js';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/providers';

export enum TransactionStatus {
  Unconfirmed, // yet to be confirmed by the user
  Pending, // confirmed and broadcasted to the mempool but not mined yet, has tx hash
  Mined, // mined on the blockchain, has a transaction hash
  Rejected, // rejected by user
}

export interface Transaction {
  id: string; // randomly generated id
  hash?: string;
  status: TransactionStatus;
  options: TransactionRequest; // the standard params such as gas, etc
  orderPreview?: OrderPreview; // used to store marketplace-specific data
  result?: RelayingResult; // only set when the tx is in Pending or Mined state
  onApprove?: (hash: string) => Promise<void>;
  onReject?: () => Promise<void>;
}

export interface OrderPreview {
  loanParameters?: {
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
  price: BigNumber;
  error?: PreviewError;
}

export interface PreviewError {
  type: PreviewErrorType;
  message: string;
  metadata: any;
}

export enum PreviewErrorType {
  UNDEFINED = 'UNDEFINED',
  UNSUPPORTED_COLLECTION = 'UNSUPPORTED_COLLECTION',
  FLOOR_PRICE = 'FLOOR_PRICE',
  INSUFFICIENT_POOL = 'INSUFFICIENT_POOL',
  UNSUPPORTED_CURRENCY = 'UNSUPPORTED_CURRENCY',
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

export type RelayingResult = TransactionResponse;
