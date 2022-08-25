import ControllerStore from './root';
import { makeAutoObservable } from 'mobx';
import {
  Transaction,
  TransactionParams,
  TransactionStatus,
} from 'types/transaction';
import createRandomId from '@utils/random';
import { SignRequest } from 'types';
import { noop } from 'lodash';
import { ethErrors } from 'eth-rpc-errors';

interface SignRequestCallbacks {
  resolve: (value?: unknown) => void;
  reject: (error?: Error) => void;
}

class TransactionStore implements TransactionStore {
  root: ControllerStore;
  transactions: Record<string, Transaction>;
  pendingSignRequests: Record<string, SignRequest> = {};
  requestCallbacks: Record<string, SignRequestCallbacks> = {};

  constructor(root: ControllerStore) {
    this.root = root;
    this.transactions = {};
    makeAutoObservable(this, { root: false, requestCallbacks: false });
  }

  get state() {
    return {
      transactions: this.transactions,
      pendingSignRequests: this.pendingSignRequests,
    };
  }

  addNewUnconfirmedTransaction(
    txParams: TransactionParams,
    txMeta?: any
  ): Transaction {
    const id = `${createRandomId()}`;
    const transaction: Transaction = {
      id,
      status: TransactionStatus.Unconfirmed,
      options: txParams,
      metadata: txMeta,
    };
    this.transactions[id] = transaction;
    return transaction;
  }

  addSignRequest(signRequest: SignRequest) {
    const { id } = signRequest;
    return new Promise<void>((resolve, reject) => {
      this.pendingSignRequests = {
        ...this.pendingSignRequests,
        [id]: signRequest,
      };
      this.requestCallbacks[id] = {
        async resolve() {
          await signRequest.onApprove();
          resolve();
        },
        async reject(err) {
          await signRequest.onReject();
          reject(err);
        },
      };
    });
  }

  confirmTransaction(id: string): Promise<Transaction> {
    let tx = this.transactions[id];
    tx.status = TransactionStatus.Pending;
    return Promise.resolve(tx);
  }

  async rejectTransaction(id: string) {
    let tx = this.transactions[id];
    tx.status = TransactionStatus.Rejected;
  }

  approveSignRequest = async (id: string) => {
    const { resolve } = this.deleteSignRequest(id);
    await resolve();
  };

  rejectSignRequest = async (id: string) => {
    const { reject } = this.deleteSignRequest(id);
    await reject(ethErrors.provider.userRejectedRequest());
  };

  private deleteSignRequest = (id: string) => {
    if (!this.requestCallbacks[id]) {
      return { resolve: noop, reject: noop };
    }

    const cbs = this.requestCallbacks[id];
    delete this.requestCallbacks[id];
    delete this.pendingSignRequests[id];
    return cbs;
  };

  getAllTransactions(): Transaction[] {
    return Object.values(this.transactions);
  }

  getUnconfirmedTransactions(): Transaction[] {
    return this.getAllTransactions().filter(
      (tx) => tx.status === TransactionStatus.Unconfirmed
    );
  }

  getPendingTransaction(): Transaction[] {
    return this.getAllTransactions().filter(
      (tx) => tx.status === TransactionStatus.Pending
    );
  }

  getMinedTransactions(): Transaction[] {
    return this.getAllTransactions().filter(
      (tx) => tx.status === TransactionStatus.Mined
    );
  }

  getRejectedTransactions(): Transaction[] {
    return this.getAllTransactions().filter(
      (tx) => tx.status === TransactionStatus.Rejected
    );
  }
}

export default TransactionStore;
