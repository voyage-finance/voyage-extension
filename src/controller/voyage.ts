/**
 * Wraps calls to the Voyage contracts and subgraph
 */
import { ethers } from 'ethers';
import { BaseProvider } from '@voyage-finance/providers';
import { Voyage, Voyage__factory } from '@contracts';

class VoyageService {
  // raw metamask provider
  readonly #provider: ethers.providers.Web3Provider;
  #voyage: Voyage;

  constructor(baseProvider: BaseProvider) {
    this.#provider = new ethers.providers.Web3Provider(baseProvider);
    this.#voyage = Voyage__factory.connect(
      '0x03283567F0BCeB25829e7A4DfE0a00D7A1E8E9A6',
      this.#provider
    );
  }

  async getVault() {
    const [account] = await this.#provider.listAccounts();
    if (!account) return;
    const vault = await this.#voyage.getVault(account);
    if (vault === ethers.constants.AddressZero) return;
    return vault;
  }
}

export default VoyageService;
