import { ethErrors } from 'eth-rpc-errors';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { ApprovalRequest } from './types';
import { IWalletConnectSession } from '@walletconnect/types';
import WalletConnect from '@walletconnect/client';
import ExtensionSessionStorage from './storage';
import { BaseProvider } from '@voyage-finance/providers';

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

  connections: Record<string, WalletConnect> = {};

  private sessionStorage: ExtensionSessionStorage;

  constructor(sessionStorage: ExtensionSessionStorage, provider: BaseProvider) {
    this.sessionStorage = sessionStorage;
    this.hydrateConnections();
    makeAutoObservable(this, { approvals: false });
  }

  get sessions() {
    const res: Record<string, IWalletConnectSession> = {};
    Object.keys(this.connections).forEach((k) => {
      res[k] = this.connections[k].session;
    });
    return res;
  }

  get state() {
    return {
      pendingApprovals: toJS(this.pendingApprovals),
      sessions: this.sessions,
    };
  }

  /**
   * Adds a WC connection and persists it
   * @param id
   * @param connection
   */
  async addConnection(id: string, connection: WalletConnect) {
    await this.sessionStorage.setSession(id, connection.session);
    this.handleDisconnect(connection);
    runInAction(() => (this.connections[id] = connection));
  }

  async getConnection(id: string) {
    return this.connections[id];
  }

  private handleDisconnect = (connection: WalletConnect) => {
    const id = connection.session.peerId;
    connection.on('disconnect', async () => {
      console.log('handling disconnect');
      await this.sessionStorage.removeSession(id);
      runInAction(() => {
        delete this.connections[id];
        console.log('deleted connection: ', id);
        console.log('connections: ', this.connections);
      });
    });
  };

  private async hydrateConnections() {
    const storedSessions = await this.sessionStorage.getSessions();
    console.log('hydrating sessions: ', storedSessions);
    const connections: Record<string, WalletConnect> = {};
    for (const k of Object.keys(storedSessions)) {
      const session = storedSessions[k];
      const connection = new WalletConnect({
        clientMeta: {
          description: 'Voyage Finance extension',
          url: 'https://voyage.finance',
          icons: ['https://walletconnect.org/walletconnect-logo.png'],
          name: 'Voyage Finance',
        },
        session,
      });
      connections[k] = connection;
      this.handleDisconnect(connection);
    }
    runInAction(() => (this.connections = connections));
  }

  add(approval: ApprovalRequest) {
    const { id } = approval;
    return new Promise<void>((resolve, reject) => {
      this.pendingApprovals = { ...this.pendingApprovals, [id]: approval };
      this.approvals[id] = {
        async resolve() {
          await approval.onApprove();
          resolve();
        },
        async reject(err) {
          await approval.onReject();
          reject(err);
        },
      };
    });
  }

  get(id: string): ApprovalRequest {
    return this.pendingApprovals[id];
  }

  async approve(id: string) {
    const { resolve } = this.delete(id);
    await resolve();
  }

  async reject(id: string) {
    const { reject } = this.delete(id);
    await reject(ethErrors.provider.userRejectedRequest());
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
