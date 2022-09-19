import { IClientMeta } from '@walletconnect/types';

export interface Account {
  address: string;
  email: string;
  keyPair?: KeyPair;
  auth: Omit<AuthInfo, 'email'>;
}

export interface KeyStorePersist {
  stage: KeyStoreStage;
  isTermsSigned: boolean;
  account: Omit<Account, 'keyPair'>;
}

interface KeyPair {
  privateKey: string;
  publicKey?: string;
}

export interface AuthInfo {
  jwt: string;
  accessToken: string;
  uid: string;
  email: string;
}

export interface ApprovalRequest<TMeta = any> {
  id: string;
  type: ApprovalType;
  metadata?: TMeta;
  client: IClientMeta;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export enum ApprovalType {
  WALLET_CONNECT,
  SIGN_MESSAGE,
  APPROVE_MARKETPLACE,
}

export enum MessageAction {
  AUTH_SUCCESS = 'auth_success',
  GET_FINGERPRINT = 'get_fingerprint',
}

export interface RuntimeMessage {
  action: MessageAction;
  params: any;
}

export enum KeyStoreStage {
  Uninitialized, // no pending sign in
  WaitingConfirm, // sign in started -> waiting confirm
  Initializing, // initializing keys
  Initialized, // done
}
