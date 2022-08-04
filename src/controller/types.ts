export enum Network {
  Mainnet = 'homestead',
  Goerli = 'goerli',
}

export interface Account {
  privateKey: string;
  publicKey: string;
  address: string;
  email: string;
}

export interface ApprovalRequest {
  id: string;
  origin: string;
  type: string;
  metadata: any;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export enum MessageAction {
  AUTH_SUCCESS = 'auth_success',
  GET_FINGERPRINT = 'get_fingerprint',
}

export interface RuntimeMessage {
  action: MessageAction;
  params: any;
}

export interface UserInfo {
  jwt: string;
  accessToken: string;
  uid: string;
  email: string;
}

export enum KeyStoreStage {
  Uninitialized, // no pending sign in
  WaitingConfirm, // sign in started -> waiting confirm
  Initializing, // initializing keys
  Initialized, // done
}
