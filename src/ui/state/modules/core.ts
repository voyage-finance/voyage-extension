import { createSlice } from '@reduxjs/toolkit';
import { store } from '../store';
import { initWeb3 } from '@web3/init';
import { ApprovalRequest } from '../../../controller/types';
import { IWalletConnectSession } from '@walletconnect/types';

interface CoreState {
  pendingApprovals: Record<string, ApprovalRequest>;
  sessions: Record<string, IWalletConnectSession>;
}

const initialState: CoreState = {
  pendingApprovals: {},
  sessions: {},
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
