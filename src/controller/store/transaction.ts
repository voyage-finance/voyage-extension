import ControllerStore from './root';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  OrderPreview,
  PreviewErrorType,
  Transaction,
  TransactionStatus,
} from 'types/transaction';
import createRandomId from '@utils/random';
import { ethErrors } from 'eth-rpc-errors';
import { formatEthersBN } from '@utils/bn';
import { TransactionRequest } from '@ethersproject/providers';
import { getContractByAddress } from '@utils/env';
import { MIN_TTL } from '@utils/constants';

interface SignRequestCallbacks {
  resolve: (value?: any) => Promise<void>;
  reject: (error?: Error) => Promise<void>;
}

class TransactionStore {
  root: ControllerStore;
  transactions: Record<string, Transaction> = {};
  requestCallbacks: Record<string, SignRequestCallbacks> = {};

  constructor(root: ControllerStore) {
    this.root = root;
    makeAutoObservable(this, { root: false });
  }

  get state() {
    return {
      transactions: this.transactions,
    };
  }

  updateTransactions = () => {
    this.transactions = { ...this.transactions };
  };

  get api() {
    return {
      confirmTransaction: this.confirmTransaction.bind(this),
      rejectTransaction: this.rejectTransaction.bind(this),
      getUnconfirmedTransactions: this.getUnconfirmedTransactions.bind(this),
      updateOrderPreviewData: this.updateOrderPreviewData.bind(this),
    };
  }

  async addNewTransaction(
    txRequest: TransactionRequest,
    onApprove: (txHash: string) => Promise<void>,
    onReject: () => Promise<void>
  ) {
    const id = `${createRandomId()}`;
    this.transactions[id] = {
      id,
      status: TransactionStatus.Unconfirmed,
      options: txRequest,
      onApprove,
      onReject,
    };

    this.requestCallbacks[id] = {
      resolve: async () => {
        const buyNowTx = await this.root.voyageStore.buyNow(txRequest);
        this.transactions[id].hash = buyNowTx.hash;
        this.transactions[id].status = TransactionStatus.Pending;
        this.updateTransactions();
        await buyNowTx.wait(+process.env.NUM_CONFIRMATIONS!);
        onApprove(buyNowTx.hash);
      },
      reject: async () => {
        onReject();
      },
    };
    setTimeout(() => this.rejectTransaction(id), MIN_TTL);
  }

  async updateOrderPreviewData(id: string) {
    let preview: OrderPreview;
    try {
      preview = await this.fetchPreviewTx(id, this.transactions[id].options);
    } catch (e: any) {
      preview = {
        error: {
          type: PreviewErrorType.UNDEFINED,
          message: e?.message || "Couldn't fetch order preview information.",
        },
      };
    }
    runInAction(() => {
      this.transactions[id].orderPreview = preview;
      this.updateTransactions();
    });
  }

  getUnconfirmedTransactions() {
    return Object.values(this.transactions).filter(
      (tx) => tx.status === TransactionStatus.Unconfirmed
    );
  }

  confirmTransaction = async (id: string): Promise<Transaction> => {
    const { resolve } = this.requestCallbacks[id];
    await resolve();
    delete this.requestCallbacks[id];
    return this.transactions[id];
  };

  async rejectTransaction(id: string) {
    this.transactions[id].status = TransactionStatus.Rejected;
    this.updateTransactions();
    const { reject } = this.requestCallbacks[id];
    delete this.requestCallbacks[id];
    await reject(ethErrors.provider.userRejectedRequest());
  }

  private fetchPreviewTx = async (
    id: string,
    transaction: TransactionRequest
  ): Promise<OrderPreview> => {
    if (!transaction.data || !transaction.to)
      throw new Error('Invalid transaction');
    const contract = getContractByAddress(transaction.to.toLowerCase());
    if (!contract)
      throw new Error("Sorry, this marketplace isn't yet supported by our app");
    const response = await fetch(
      `${process.env.VOYAGE_API_URL}/v1/marketplace/preview/${contract}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calldata: transaction.data,
          speed: 'fast',
          vault: this.root.voyageStore.vaultAddress,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      Promise.reject(data);
    }

    return {
      ...data,
      price: formatEthersBN(data.price),
      loanParameters: data.loanParameters
        ? {
            ...data.loanParameters,
            payment: {
              pmt: formatEthersBN(data.loanParameters.pmt.pmt),
              principal: formatEthersBN(data.loanParameters.pmt.principal),
              fee: formatEthersBN(data.loanParameters.pmt.fee),
              interest: formatEthersBN(data.loanParameters.pmt.interest),
            },
          }
        : undefined,
    };
  };
}

export default TransactionStore;
