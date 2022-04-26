import { ethErrors } from 'eth-rpc-errors';
import { makeAutoObservable } from 'mobx';
import { ApprovalRequest } from './types';

type ApprovalPromiseResolve = (value?: unknown) => void;
type ApprovalPromiseReject = (error?: Error) => void;
interface ApprovalCallbacks {
  resolve: ApprovalPromiseResolve;
  reject: ApprovalPromiseReject;
}

const noop = () => undefined;

class ControllerState {
  approvals: Record<string, ApprovalCallbacks> = {};

  pendingApprovals: Record<string, ApprovalRequest> = {};

  constructor() {
    makeAutoObservable(this, { approvals: false });
  }

  get state() {
    return {
      pendingApprovals: this.pendingApprovals,
    };
  }

  add(approval: ApprovalRequest) {
    const { id } = approval;
    return new Promise((resolve, reject) => {
      this.pendingApprovals = { ...this.pendingApprovals, [id]: approval };
      this.approvals[id] = { resolve, reject };
    });
  }

  get(id: string): ApprovalRequest {
    return this.pendingApprovals[id];
  }

  approve(id: string) {
    const { resolve } = this.delete(id);
    resolve();
  }

  reject(id: string) {
    const { reject } = this.delete(id);
    reject(ethErrors.provider.userRejectedRequest());
  }

  private delete(id: string) {
    if (!this.approvals[id]) {
      return { resolve: noop, reject: noop };
    }

    const cbs = this.approvals[id];
    delete this.approvals[id];
    delete this.pendingApprovals[id];
    return cbs;
  }
}

export default ControllerState;
