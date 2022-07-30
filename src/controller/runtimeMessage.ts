import { VoyageController } from 'controller';
import { toJS } from 'mobx';
import { runtime } from 'webextension-polyfill';
import { MessageAction, RuntimeMessage } from './types';

const VOYAGE_WEB_URL = 'http://localhost:8080';

export const registerMessageListeners = (controller: VoyageController) => {
  runtime.onMessageExternal.addListener((msg: RuntimeMessage, params) => {
    console.log('--- onMessageExternal ---', msg, params);
    let response = undefined;
    if (params.url?.startsWith(VOYAGE_WEB_URL)) {
      switch (msg.action) {
        case MessageAction.AUTH_SUCCESS:
          controller.store.keyStore.finishLogin(msg.params.jwt);
          break;
        case MessageAction.GET_FINGERPRINT:
          const pendingLogin = toJS(controller.getState().pendingLogin);
          response = pendingLogin?.fingerprint;
      }
    }
    return Promise.resolve(response);
  });
};
