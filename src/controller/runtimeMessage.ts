import { VoyageController } from 'controller';
import { toJS } from 'mobx';
import { runtime } from 'webextension-polyfill';
import { MessageAction, RuntimeMessage, AuthInfo } from '../types';

export const registerMessageListeners = (controller: VoyageController) => {
  runtime.onMessageExternal.addListener((msg: RuntimeMessage, params) => {
    console.log('--- onMessageExternal ---', msg, params);
    let response = undefined;
    if (params.url?.startsWith(process.env.VOYAGE_WEB_URL!)) {
      switch (msg.action) {
        case MessageAction.AUTH_SUCCESS:
          controller.store.keyStore.startInitializing(msg.params as AuthInfo);
          break;
        case MessageAction.GET_FINGERPRINT:
          response = toJS(controller.getState().pendingLogin)?.fingerprint;
      }
    }
    return Promise.resolve(response);
  });
};
