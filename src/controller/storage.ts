import { IWalletConnectSession } from '@walletconnect/types';
import browser from 'webextension-polyfill';

const NS = 'finance.voyage.walletconnect.sessions';

class ExtensionSessionStorage {
  readonly #ns: string;

  constructor(namespace: string = NS) {
    this.#ns = namespace;
  }

  async getSessions(): Promise<{ [key: string]: IWalletConnectSession }> {
    const data = await this.#getNamespace();
    const res: { [key: string]: IWalletConnectSession } = {};
    for (const key of Object.keys(data)) {
      res[key] = JSON.parse(data[key]);
    }
    return res;
  }

  async getSession(key: string): Promise<IWalletConnectSession | undefined> {
    const sessions = await this.getSessions();
    const { [key]: session } = sessions;
    return session;
  }

  async setSession(key: string, session: IWalletConnectSession) {
    const existingSessions = await this.getSessions();
    const serialised: Record<string, string> =
      ExtensionSessionStorage.#serialise({
        ...existingSessions,
        [key]: session,
      });
    await browser.storage.local.set({ [this.#ns]: serialised });
  }

  async nuke() {
    await browser.storage.local.remove(this.#ns);
  }

  async removeSession(key: string) {
    const sessions = await this.getSessions();
    delete sessions[key];
    await browser.storage.local.set({
      [this.#ns]: ExtensionSessionStorage.#serialise(sessions),
    });
  }

  static #serialise(sessions: Record<string, IWalletConnectSession>) {
    const serialised: Record<string, string> = {};
    for (const key of Object.keys(sessions)) {
      serialised[key] = JSON.stringify(sessions[key]);
    }
    return serialised;
  }

  async #getNamespace(): Promise<{ [key: string]: string }> {
    const obj = await browser.storage.local.get(this.#ns);
    return obj?.[this.#ns] ?? {};
  }
}

export default ExtensionSessionStorage;
