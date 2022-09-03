import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { store } from '../store';
import { initWeb3 } from '@web3/init';
import {
  ApprovalRequest,
  KeyStoreStage,
  AuthInfo,
  SignRequest,
} from '../../../types';
import { IWalletConnectSession } from '@walletconnect/types';
import { PendingLogin } from 'controller/store/key';
import { Transaction } from 'types/transaction';

export type TabInfo = {
  origin: string;
  url: string;
};

interface CoreState {
  pendingApprovals: Record<string, ApprovalRequest>;
  pendingSignRequests: Record<string, SignRequest>;
  transactions: Transaction[];
  sessions: Record<string, IWalletConnectSession>;
  pendingLogin?: PendingLogin;
  stage: KeyStoreStage;
  authInfo?: AuthInfo;
  isTermsSigned: boolean;
  vaultAddress?: string;
  activeTab?: TabInfo;
}

const initialState: CoreState = {
  pendingApprovals: {},
  sessions: {},
  pendingSignRequests: {},
  transactions: [],
  stage: KeyStoreStage.Uninitialized,
  isTermsSigned: false,
};

const core = createSlice({
  name: 'core',
  initialState,
  reducers: {
    updateState(state, action): CoreState {
      console.log('received state update: ', action);
      return { ...state, ...action.payload };
    },
    updateActiveTab(state, action: PayloadAction<TabInfo>) {
      console.log('received state active tab: ', action);
      state.activeTab = action.payload;
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
export const { updateState, updateActiveTab } = actions;
export default reducer;
