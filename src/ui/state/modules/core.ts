import { createSlice } from '@reduxjs/toolkit';
import { store } from '../store';
import { initWeb3 } from '@web3/init';
import { ApprovalRequest } from '../../../controller/types';

interface CoreState {
  pendingApprovals: Record<string, ApprovalRequest>;
}

const initialState: CoreState = {
  pendingApprovals: {},
};

const core = createSlice({
  name: 'core',
  initialState,
  reducers: {
    updateState(state, action) {
      console.warn('received state update: ', JSON.stringify(action));
      state = { ...state, ...action.payload };
    },
  },
});

const { controller } = initWeb3();

controller.onNotification((update: any) => {
  if (update.method === 'sendUpdate') {
    store.dispatch(core.actions.updateState(update.params[0]));
  }
});

export default core.reducer;
