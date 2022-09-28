export const DEFAULT_ROUTE = '/';

export const ONBOARD_CHECK_EMAIL_ROUTE = '/onboard/checkemail';
export const ONBOARD_INITIALIZING_ROUTE = '/onboard/boarding';
export const ONBOARD_LOGIN_ROUTE = '/onboard/login';
export const ONBOARD_TERMS_ROUTE = '/onboard/terms';

export const VAULT_DEPOSIT_DEPLOYED_ROUTE = '/vault/deposit/deployed';
export const VAULT_DEPOSIT_METHODS_ROUTE = '/vault/deposit/method';

export const APPROVAL_ROUTE = '/approval';

export const PURCHASE_OVERVIEW_ROUTE = '/purchase';

export enum ChainID {
  Mainnet = 1,
  Goerli = 5,
  Localhost = 31337,
}

export enum Marketplace {
  Looks = 'looksrare',
  Opensea = 'opensea',
  Unsupported = 'unsupported',
}

type AddressMapping = Record<ChainID, string>;

export const WETH_ADDRESS: AddressMapping = {
  [ChainID.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ChainID.Goerli]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  [ChainID.Localhost]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
};

export const LOOKS_ADDRESS: Record<ChainID, string> = {
  [ChainID.Mainnet]: '0x59728544B08AB483533076417FbBB2fD0B17CE3a',
  [ChainID.Goerli]: '0xD112466471b5438C1ca2D218694200e49d81D047',
  [ChainID.Localhost]: '0xD112466471b5438C1ca2D218694200e49d81D047',
};

export const PAYMASTER_ADDRESS: Record<ChainID, string> = {
  [ChainID.Mainnet]: '0x22e0b65027160cC7B729C08E5AaD6e075364D557',
  [ChainID.Goerli]: '0xA1FB4A7336F91F2b9A1bA26bbDEAE1Cf570b589C',
  [ChainID.Localhost]: '0xA1FB4A7336F91F2b9A1bA26bbDEAE1Cf570b589C',
};

export const VOYAGE_ADDRESS: Record<ChainID, string> = {
  [ChainID.Mainnet]: '0xbaf6FD0b5D060899AfE7d0717eE65D80Fe6911F5',
  [ChainID.Goerli]: '0x4aFb3904e9f0615Aa15eb3208484BdcE7595bb79',
  [ChainID.Localhost]: '0x4aFb3904e9f0615Aa15eb3208484BdcE7595bb79',
};

export const OPENSEA_HOSTS: AddressMapping = {
  [ChainID.Mainnet]: 'opensea.io',
  [ChainID.Goerli]: 'testnets.opensea.io',
  [ChainID.Localhost]: 'testnets.opensea.io',
};

export const LOOKS_HOSTS: AddressMapping = {
  [ChainID.Mainnet]: 'looksrare.org',
  [ChainID.Goerli]: 'goerli.looksrare.org',
  [ChainID.Localhost]: 'goerli.looksrare.org',
};

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const MIN_TTL = 300000; //  5 minutes

export const MAX_UINT256 =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';
