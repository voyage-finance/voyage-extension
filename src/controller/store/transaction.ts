import ControllerStore from './root';
import { makeAutoObservable } from 'mobx';
import {
  OrderPreview,
  Transaction,
  TransactionParams,
  TransactionStatus,
} from 'types/transaction';
import createRandomId from '@utils/random';
import { SignRequest } from 'types';
import { noop } from 'lodash';
import { ethErrors } from 'eth-rpc-errors';
import { formatEthersBN } from '@utils/bn';

interface SignRequestCallbacks {
  resolve: (value?: unknown) => void;
  reject: (error?: Error) => void;
}

class TransactionStore implements TransactionStore {
  root: ControllerStore;
  transactions: Record<string, Transaction>;
  txOrderPreviewMap: Record<string, OrderPreview>;
  pendingSignRequests: Record<string, SignRequest> = {};
  requestCallbacks: Record<string, SignRequestCallbacks> = {};

  constructor(root: ControllerStore) {
    this.root = root;
    this.transactions = {};
    this.txOrderPreviewMap = {};
    makeAutoObservable(this, { root: false, requestCallbacks: false });
  }

  get state() {
    return {
      transactions: this.transactions,
      pendingSignRequests: this.pendingSignRequests,
      txOrderPreviewMap: this.txOrderPreviewMap,
    };
  }

  addNewTransaction(
    txParams: TransactionParams,
    fetchPreview = true
  ): Transaction {
    const id = `${createRandomId()}`;
    const transaction: Transaction = {
      id,
      status: TransactionStatus.Initial,
      options: txParams,
    };
    this.transactions[id] = transaction;
    if (fetchPreview) this.fetchPreviewTx(id, txParams);
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
    const tx = this.transactions[id];
    tx.status = TransactionStatus.Pending;
    return Promise.resolve(tx);
  }

  async rejectTransaction(id: string) {
    const tx = this.transactions[id];
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

  private fetchPreviewTx = async (id: string, txParams: TransactionParams) => {
    const response = await fetch(
      `${process.env.VOYAGE_API_URL}/v1/marketplace/preview/looksrare`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calldata: txParams.data,
          speed: 'fast',
          vault: this.root.voyageStore.vaultAddress,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      Promise.reject(data);
    }
    const orderPreview = {
      ...data,
      loanParameters: {
        ...data.loanParameters,
        payment: {
          pmt: formatEthersBN(data.loanParameters.pmt.pmt),
          principal: formatEthersBN(data.loanParameters.pmt.principal),
          interest: formatEthersBN(data.loanParameters.pmt.interest),
        },
      },
      price: formatEthersBN(data.price),
    };
    console.log('[tx preview]', orderPreview);
    this.transactions[id].orderPreview = orderPreview;
    this.txOrderPreviewMap[id] = orderPreview;
    console.log(
      '🚀 ~ fetchPreviewTx ~ txOrderPreviewMap',
      this.txOrderPreviewMap
    );
  };
}

export default TransactionStore;
