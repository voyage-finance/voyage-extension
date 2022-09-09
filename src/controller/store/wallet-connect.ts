import { IWalletConnectSession } from '@walletconnect/types';
import browser from 'webextension-polyfill';
import { ApprovalRequest } from '../../types';
import WalletConnect from '@walletconnect/client';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { ethErrors } from 'eth-rpc-errors';
import { noop } from 'lodash';
import ControllerStore from './root';
import { createWcStream } from '../wcStream';
import { Duplex } from 'stream';

const NS = 'finance.voyage.walletconnect.sessions';

type ApprovalPromiseResolve = (value?: unknown) => void;

type ApprovalPromiseReject = (error?: Error) => void;

interface ApprovalCallbacks {
  resolve: ApprovalPromiseResolve;
  reject: ApprovalPromiseReject;
}

class WalletConnectStore {
  readonly ns: string;

  root: ControllerStore;

  requestCallbacks: Record<string, ApprovalCallbacks> = {};

  pendingConnectionRequests: Record<string, ApprovalRequest> = {};

  connections: Record<string, WalletConnect> = {};

  constructor(root: ControllerStore, namespace: string = NS) {
    this.root = root;
    this.ns = namespace;
    this.hydrateConnections();
    makeAutoObservable(this, { root: false, requestCallbacks: false });
  }

  get state() {
    return {
      pendingApprovals: toJS(this.pendingConnectionRequests),
      sessions: this.sessions,
    };
  }

  get sessions() {
    const res: Record<string, IWalletConnectSession> = {};
    Object.keys(this.connections).forEach((k) => {
      res[k] = this.connections[k].session;
    });
    return res;
  }

  /**
   * Adds a WC connection and persists it
   * @param id
   * @param connection
   */
  addConnection = async (id: string, connection: WalletConnect) => {
    await this.setSession(id, connection.session);
    this.handleDisconnect(connection);
    runInAction(() => (this.connections[id] = connection));
  };

  getConnection = (id: string) => {
    return this.connections[id];
  };

  private handleDisconnect = (connection: WalletConnect) => {
    const id = connection.session.peerId;
    connection.on('disconnect', async () => {
      await this.removeSession(id);
      runInAction(() => {
        delete this.connections[id];
      });
    });
  };

  private async hydrateConnections() {
    const storedSessions = await this.getSessions();
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
      this.root.controller.setupVoyageProviderConnection(
        createWcStream(connection) as Duplex
      );
      this.handleDisconnect(connection);
    }
    runInAction(() => (this.connections = connections));
  }

  /**
   * Adds a pending connection request.
   * These are deleted after they are either approved or rejected.
   * @param approval
   */
  addConnectionRequest = (approval: ApprovalRequest) => {
    const { id } = approval;
    return new Promise<void>((resolve, reject) => {
      this.pendingConnectionRequests = {
        ...this.pendingConnectionRequests,
        [id]: approval,
      };
      this.requestCallbacks[id] = {
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
  };

  /**
   * Retrieve a pending connection request by id.
   * @param id
   * @returns ApprovalRequest
   */
  getConnectionRequest = (id: string): ApprovalRequest => {
    return this.pendingConnectionRequests[id];
  };

  /**
   * Approves a connection request by id and runs approval callback.
   * @param id
   */
  approveConnectionRequest = async (id: string) => {
    const { resolve } = this.deleteConnectionRequest(id);
    await resolve();
  };

  /**
   * Rejects a connection request and runs rejection callback.
   * @param id
   */
  rejectConnectionRequest = async (id: string) => {
    const { reject } = this.deleteConnectionRequest(id);
    await reject(ethErrors.provider.userRejectedRequest());
  };

  /**
   * Deletes in-memory connection request. THis is always called regardless of approval or rejection.
   * @param id
   */
  private deleteConnectionRequest = (id: string) => {
    if (!this.requestCallbacks[id]) {
      return { resolve: noop, reject: noop };
    }

    const cbs = this.requestCallbacks[id];
    delete this.requestCallbacks[id];
    delete this.pendingConnectionRequests[id];
    return cbs;
  };

  /**
   * Returns all active WC sessions
   */
  getSessions = async (): Promise<{ [key: string]: IWalletConnectSession }> => {
    const data = await this.getNamespace();
    const res: { [key: string]: IWalletConnectSession } = {};
    for (const key of Object.keys(data)) {
      res[key] = JSON.parse(data[key]);
    }
    return res;
  };

  getSession = async (
    key: string
  ): Promise<IWalletConnectSession | undefined> => {
    const sessions = await this.getSessions();
    return sessions[key];
  };

  /**
   * Saves a WC session in extension storage.
   * @param key
   * @param session
   */
  setSession = async (key: string, session: IWalletConnectSession) => {
    const existingSessions = await this.getSessions();
    const serialised: Record<string, string> = WalletConnectStore.#serialise({
      ...existingSessions,
      [key]: session,
    });
    await browser.storage.local.set({ [this.ns]: serialised });
  };

  /**
   * Kills all current wallet connect sessions
   */
  nuke = async () => {
    await browser.storage.local.remove(this.ns);
  };

  /**
   * Remove a WalletConnect session
   * @param key
   */
  removeSession = async (key: string) => {
    const sessions = await this.getSessions();
    delete sessions[key];
    await browser.storage.local.set({
      [this.ns]: WalletConnectStore.#serialise(sessions),
    });
  };

  static #serialise(sessions: Record<string, IWalletConnectSession>) {
    const serialised: Record<string, string> = {};
    for (const key of Object.keys(sessions)) {
      serialised[key] = JSON.stringify(sessions[key]);
    }
    return serialised;
  }

  async getNamespace(): Promise<{ [key: string]: string }> {
    const obj = await browser.storage.local.get(this.ns);
    return obj?.[this.ns] ?? {};
  }
}

export default WalletConnectStore;
