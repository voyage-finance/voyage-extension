import { Web3Provider } from '@ethersproject/providers';
import { BaseProvider } from '@voyage-finance/providers';
import { Signer, utils } from 'ethers';
import {
  AddChainError,
  allChains,
  Chain,
  ChainNotConfiguredError,
  Connector,
  ConnectorData,
  ConnectorNotFoundError,
  normalizeChainId,
  SwitchChainError,
  UserRejectedRequestError,
} from 'wagmi';
import browser from 'webextension-polyfill';

export interface ExtensionConnectorOptions {
  shimDisconnect?: boolean;
  shimChainChangedDisconnect?: boolean;
}

export interface ExtensionConnectorConfig {
  provider: BaseProvider;
  chains?: Chain[];
  options?: ExtensionConnectorOptions;
}

const SHIM_KEY = 'wagmi.extensionConnector.shimDisconnect';

/**
 * ExtensionConnector is intended for use in an extension environment.
 * It will NOT work in the general browser context.
 */
export class ExtensionConnector extends Connector<
  BaseProvider,
  ExtensionConnectorOptions | undefined
> {
  readonly id: string = 'mm_extension';

  readonly name: string = 'MetaMask extension connector';

  provider: BaseProvider;

  constructor({ provider, chains, options = {} }: ExtensionConnectorConfig) {
    super({ chains, options });
    this.provider = provider;
  }

  getProvider(): BaseProvider {
    return this.provider;
  }

  async connect(): Promise<ConnectorData> {
    try {
      const provider = this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        if (this.options?.shimChainChangedDisconnect) {
          provider.on('disconnect', this.onDisconnect);
        }
      }

      const account = await this.getAccount();
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);

      if (this.options?.shimDisconnect) {
        await browser.storage.local.set({ [SHIM_KEY]: true });
      }

      return { account, chain: { id: chainId, unsupported }, provider };
    } catch (err) {
      if ((err as ProviderRpcError).code === 4001) {
        throw new UserRejectedRequestError();
      }
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    const provider = this.getProvider();
    if (!provider?.removeListener) {
      provider.removeListener('accountsChanged', this.onAccountsChanged);
      provider.removeListener('chainChanged', this.onChainChanged);
      provider.removeListener('disconnect', this.onDisconnect);
    }

    if (this.options?.shimDisconnect) {
      await browser.storage.local.remove(SHIM_KEY);
    }
  }

  async getAccount(): Promise<string> {
    const provider = this.getProvider();
    const accounts: any = await provider.request({
      method: 'eth_requestAccounts',
    });
    return Promise.resolve(utils.getAddress(accounts[0]));
  }

  async getChainId(): Promise<number> {
    const provider = this.getProvider();
    const chainId = await provider.request({ method: 'eth_chainId' });
    return chainId as number;
  }

  async getSigner(): Promise<Signer> {
    const provider = this.getProvider();
    const account = await this.getAccount();
    return new Web3Provider(provider).getSigner(account);
  }

  async isAuthorized() {
    try {
      if (this.options?.shimDisconnect) {
        const tuple = await browser.storage.local.get(SHIM_KEY);
        return !!tuple[SHIM_KEY];
      }

      const provider = this.getProvider();
      if (!provider) {
        return false;
      }

      const accounts = await provider.request<string[]>({
        method: 'eth_accounts',
      });
      return !!accounts?.[0];
    } catch (err) {
      console.error('something went wrong: ', err);
      return false;
    }
  }

  async switchChain(chainId: number) {
    const provider = this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const id = utils.hexValue(chainId);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });
      const chains = [...this.chains, ...allChains];
      return chains.find((x) => x.id === chainId);
    } catch (error) {
      // Indicates chain is not added to MetaMask
      if ((error as ProviderRpcError).code === 4902) {
        try {
          const chain = this.chains.find((x) => x.id === chainId);
          if (!chain) throw new ChainNotConfiguredError();
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: id,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorers?.map((x) => x.url),
              },
            ],
          });
          return chain;
        } catch (addError) {
          throw new AddChainError();
        }
      } else if ((error as ProviderRpcError).code === 4001)
        throw new UserRejectedRequestError();
      else throw new SwitchChainError();
    }
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.emit('disconnect');
    } else {
      this.emit('change', { account: utils.getAddress(accounts[0]) });
    }
  }

  protected onChainChanged(chain: number | string): void {
    const id = normalizeChainId(chain);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  }

  protected async onDisconnect() {
    this.emit('disconnect');
    if (this.options?.shimDisconnect) {
      await browser.storage.local.remove(SHIM_KEY);
    }
  }

  readonly ready: boolean = true;
}
