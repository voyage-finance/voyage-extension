import ControllerStore from './root';
import { makeAutoObservable } from 'mobx';
import {
  Transaction,
  TransactionParams,
  TransactionStatus,
} from 'types/transaction';
import createRandomId from '@utils/random';

class TransactionStore implements TransactionStore {
  root: ControllerStore;
  transactions: Record<string, Transaction>;

  constructor(root: ControllerStore) {
    this.root = root;
    this.transactions = {};
    makeAutoObservable(this, { root: false });
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

  confirmTransaction(id: string): Promise<Transaction> {
    let tx = this.transactions[id];
    tx.status = TransactionStatus.Pending;
    return Promise.resolve(tx);
  }

  async rejectTransaction(id: string) {
    let tx = this.transactions[id];
    tx.status = TransactionStatus.Rejected;
  }

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

  get state() {
    return {
      transactions: this.transactions,
    };
  }
}

export default TransactionStore;
