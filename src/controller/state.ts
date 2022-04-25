import { makeAutoObservable } from 'mobx';
import { ApprovalRequest } from './types';

type ApprovalPromiseResolve = (value?: unknown) => void;
type ApprovalPromiseReject = (error?: Error) => void;
interface ApprovalCallbacks {
  resolve: ApprovalPromiseResolve;
  reject: ApprovalPromiseReject;
}

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
    delete this.pendingApprovals[id];
  }
}

export default ControllerState;
