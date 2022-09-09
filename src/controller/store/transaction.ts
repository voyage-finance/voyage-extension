import ControllerStore from './root';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  OrderPreview,
  Transaction,
  TransactionStatus,
} from 'types/transaction';
import createRandomId from '@utils/random';
import { SignRequest } from 'types';
import { noop } from 'lodash';
import { ethErrors } from 'eth-rpc-errors';
import { formatEthersBN } from '@utils/bn';
import { TransactionRequest } from '@ethersproject/providers';

interface SignRequestCallbacks {
  resolve: (value?: any) => Promise<void>;
  reject: (error?: Error) => Promise<void>;
}

class TransactionStore implements TransactionStore {
  root: ControllerStore;
  transactions: Record<string, Transaction> = {};
  txOrderPreviewMap: Record<string, OrderPreview> = {};
  pendingSignRequests: Record<string, SignRequest> = {};
  requestCallbacks: Record<string, SignRequestCallbacks> = {};

  constructor(root: ControllerStore) {
    this.root = root;
    makeAutoObservable(this, { root: false, requestCallbacks: false });
  }

  get state() {
    return {
      transactions: this.transactions,
      pendingSignRequests: this.pendingSignRequests,
      txOrderPreviewMap: { ...this.txOrderPreviewMap },
    };
  }

  async addNewTransaction(
    txRequest: TransactionRequest,
    onApprove: (txHash: string) => Promise<void>,
    onReject: () => Promise<void>,
    fetchPreview = true
  ) {
    const id = `${createRandomId()}`;
    this.transactions[id] = {
      id,
      status: TransactionStatus.Initial,
      options: txRequest,
      onApprove,
      onReject,
    };
    this.requestCallbacks[id] = {
      resolve: async () => {
        const res = await this.root.voyageStore.buyNow(txRequest);
        this.transactions[id] = {
          ...this.transactions[id],
          hash: res.hash,
          status: TransactionStatus.Pending,
        };
        onApprove(res.hash);
      },
      reject: async () => {
        onReject();
      },
    };
    if (fetchPreview) {
      const preview = await this.fetchPreviewTx(id, txRequest);
      runInAction(() => {
        this.transactions[id].orderPreview = preview;
        this.txOrderPreviewMap[id] = preview;
      });
    }
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

  confirmTransaction = async (id: string): Promise<Transaction> => {
    const { resolve } = this.requestCallbacks[id];
    await resolve();
    delete this.requestCallbacks[id];
    return this.transactions[id];
  };

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

  private fetchPreviewTx = async (id: string, txParams: TransactionRequest) => {
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

    return {
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
  };
}

export default TransactionStore;
