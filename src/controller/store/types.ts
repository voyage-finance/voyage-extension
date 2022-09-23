export interface IControllerStore {
  api: Record<string, (...args: any[]) => any>;
  state?: Record<string, any>;
}

export interface NFTData {
  tokenId: string;
  collection: string;
}

export interface OrderData extends NFTData {
  marketplace: string;
}
