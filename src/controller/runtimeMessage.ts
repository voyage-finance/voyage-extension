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
          const session: AuthInfo = msg.params;
          controller.store.keyStore.finishLogin(session);
          break;
        case MessageAction.GET_FINGERPRINT:
          const pendingLogin = toJS(controller.getState().pendingLogin);
          response = pendingLogin?.fingerprint;
      }
    }
    return Promise.resolve(response);
  });
};
