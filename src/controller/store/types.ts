export interface IControllerStore {
  api: Record<string, (...args: any[]) => any>;
  state?: Record<string, any>;
}

export interface OrderData {
  marketplace: string;
  tokenId: string;
  collection: string;
}
