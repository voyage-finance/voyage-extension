import { createSlice } from '@reduxjs/toolkit';
import { store } from '../store';
import { initWeb3 } from '@web3/init';
import {
  ApprovalRequest,
  KeyStoreStage,
  UserInfo,
} from '../../../controller/types';
import { IWalletConnectSession } from '@walletconnect/types';
import { PendingLogin } from 'controller/store/key';

interface CoreState {
  pendingApprovals: Record<string, ApprovalRequest>;
  sessions: Record<string, IWalletConnectSession>;
  pendingLogin?: PendingLogin;
  stage: KeyStoreStage;
  currentUser?: UserInfo;
}

const initialState: CoreState = {
  pendingApprovals: {},
  sessions: {},
  stage: KeyStoreStage.Uninitialized,
};

const core = createSlice({
  name: 'core',
  initialState,
  reducers: {
    updateState(state, action) {
      console.log('received state update: ', action);
      return action.payload;
    },
  },
});

const { controller } = initWeb3();

controller.onNotification((update: any) => {
  console.log('[ui] store received update: ', update);
  if (update.method === 'sendUpdate') {
    store.dispatch(core.actions.updateState(update.params[0]));
  }
});

const { actions, reducer } = core;
export const { updateState } = actions;
export default reducer;
