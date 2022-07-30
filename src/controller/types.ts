export enum Network {
  Mainnet = 'homestead',
  Rinkeby = 'rinkeby',
}

export interface Account {
  privateKey: string;
  publicKey: string;
  address: string;
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
