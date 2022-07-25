import { Web3Provider } from '@ethersproject/providers';
import { BaseProvider } from '@voyage-finance/providers';
import { normalizeChainId } from '@wagmi/core';
import { Signer, utils } from 'ethers';
import {
  AddChainError,
  allChains,
  Chain,
  ChainNotConfiguredError,
  Connector,
  ConnectorNotFoundError,
  ProviderRpcError,
  RpcError,
  SwitchChainError,
  UserRejectedRequestError,
} from 'wagmi';
import { isEmpty } from 'lodash';
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

  readonly ready: boolean = true;

  #provider: BaseProvider;

  constructor({ provider, chains, options = {} }: ExtensionConnectorConfig) {
    super({ chains, options });
    this.#provider = provider;
  }

  async getProvider() {
    return this.#provider;
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect);
      }
      this.emit('message', { type: 'connecting' });
      const isConnected = await browser.storage.local
        .get(SHIM_KEY)
        .then((v) => !isEmpty(v));
      if (this.options?.shimDisconnect && !isConnected) {
        const accounts: any = await provider
          .request({
            method: 'eth_accounts',
          })
          .catch(() => []);
        const isConnected = !!accounts[0];
        if (isConnected)
          await provider.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
      }

      const account = await this.getAccount();
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }

      if (this.options?.shimDisconnect) {
        await browser.storage.local.set({ [SHIM_KEY]: true });
      }

      return { account, chain: { id, unsupported }, provider };
    } catch (err) {
      if ((err as RpcError).code === 4001) {
        throw new UserRejectedRequestError(err);
      }
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;
    provider.removeListener('accountsChanged', this.onAccountsChanged);
    provider.removeListener('chainChanged', this.onChainChanged);
    provider.removeListener('disconnect', this.onDisconnect);

    if (this.options?.shimDisconnect) {
      await browser.storage.local.remove(SHIM_KEY);
    }
  }

  async getAccount(): Promise<string> {
    const provider = await this.getProvider();
    const accounts: any = await provider.request({
      method: 'eth_accounts',
    });
    return accounts[0] ? utils.getAddress(accounts[0]) : '';
  }

  async getChainId() {
    const provider = await this.getProvider();
    const chainId = await provider.request({ method: 'eth_chainId' });
    return normalizeChainId(chainId as number);
  }

  async getSigner(): Promise<Signer> {
    const provider = await this.getProvider();
    const account = await this.getAccount();
    return new Web3Provider(provider).getSigner(account);
  }

  async isAuthorized() {
    try {
      if (this.options?.shimDisconnect) {
        const tuple = await browser.storage.local.get(SHIM_KEY);
        return !!tuple[SHIM_KEY];
      }

      const provider = await this.getProvider();
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
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const id = utils.hexValue(chainId);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });
      const chains = [...this.chains, ...allChains];
      return (
        chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          rpcUrls: { default: '' },
        }
      );
    } catch (error) {
      // Indicates chain is not added to MetaMask
      if (
        (error as ProviderRpcError).code === 4902 ||
        // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
        (<RpcError<{ originalError?: { code: number } }>>error)?.data
          ?.originalError?.code === 4902
      ) {
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
                rpcUrls: [chain.rpcUrls.public ?? chain.rpcUrls.default],
                blockExplorerUrls: this.getBlockExplorerUrls(chain),
              },
            ],
          });
          return chain;
        } catch (addError) {
          throw new AddChainError();
        }
      } else if ((error as ProviderRpcError).code === 4001)
        throw new UserRejectedRequestError(error);
      else throw new SwitchChainError(error);
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

  protected isUserRejectedRequestError(error: unknown) {
    return (error as ProviderRpcError).code === 4001;
  }
}
