export const DEFAULT_ROUTE = '/';

export const ONBOARD_CHECK_EMAIL_ROUTE = '/onboard/checkemail';
export const ONBOARD_INITIALIZING_ROUTE = '/onboard/boarding';
export const ONBOARD_LOGIN_ROUTE = '/onboard/login';
export const ONBOARD_TERMS_ROUTE = '/onboard/terms';

export const VAULT_DEPOSIT_DEPLOYED_ROUTE = '/vault/deposit/deployed';
export const VAULT_DEPOSIT_METHODS_ROUTE = '/vault/deposit/method';

export const APPROVAL_ROUTE = '/approval';

export const PURCHASE_OVERVIEW_ROUTE = '/purchase';

export const LOOKS_EXCHANGE_TESTNET =
  '0xd112466471b5438c1ca2d218694200e49d81d047'.toLowerCase();

export const SEAPORT_EXCHANGE_TESTNET =
  '0x00000000006c3852cbef3e08e8df289169ede581'.toLowerCase();

export const VOYAGE_GOERLI =
  '0x4aFb3904e9f0615Aa15eb3208484BdcE7595bb79'.toLowerCase();

export const WETH9_GOERLI = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';

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

export const OPENSEA_HOSTS = {
  [ChainID.Mainnet]: 'opensea.io',
  [ChainID.Goerli]: 'testnets.opensea.io',
  [ChainID.Localhost]: 'testnets.opensea.io',
};

export const LOOKS_HOSTS = {
  [ChainID.Mainnet]: 'looksrare.org',
  [ChainID.Goerli]: 'goerli.looksrare.org',
  [ChainID.Localhost]: 'goerli.looksrare.org',
};

export const LOOKS_ADDRESS: Record<ChainID, string> = {
  [ChainID.Mainnet]: '0x59728544B08AB483533076417FbBB2fD0B17CE3a',
  [ChainID.Goerli]: '0xD112466471b5438C1ca2D218694200e49d81D047',
  [ChainID.Localhost]: '0xD112466471b5438C1ca2D218694200e49d81D047',
};
export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
