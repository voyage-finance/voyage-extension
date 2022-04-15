import { Duplex } from "stream";
import { setupMultiplex } from "../../utils";
import controllerFactory from "../../rpc/virtual/client";
import browser from "webextension-polyfill";
import PortStream from "extension-port-stream";
import { BaseProvider } from "@voyage-finance/providers";

export const initWeb3 = () => {
  const port = browser.runtime.connect({ name: 'voyage-popup' });
  const backgroundStream = new PortStream(port) as unknown as Duplex;
  const mux = setupMultiplex(backgroundStream);
  const controller = controllerFactory(mux.createStream('controller') as Duplex);
  const provider = new BaseProvider(mux.createStream('provider') as Duplex);

  globalThis.controller = controller;
  globalThis.provider = provider;

  return { controller, provider };
}
