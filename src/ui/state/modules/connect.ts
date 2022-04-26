import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ConnectionState {
  connected: boolean;
  session?: WalletConnectSession;
}

const initialState: ConnectionState = {
  connected: false,
};

const connect = createSlice({
  name: 'wc',
  initialState,
  reducers: {
    connect: () => {
      // state.connected = true;
      // state.session = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectWithWC.fulfilled, (state, action) => {
      console.warn('connected with WC: ', JSON.stringify(action, null, 4));
      state.connected = true;
      state.session = action.payload;
    });
  },
});

interface PeerMeta {
  description?: string;
  icons?: string[];
  name: string;
  url: string;
}

interface WalletConnectSession {
  peerId: string;
  peerMeta: PeerMeta;
}

export const connectWithWC = createAsyncThunk<
  WalletConnectSession | undefined,
  string
>('wc/connect', async (uri: string) => {
  try {
    return globalThis.controller.connectWithWC(uri);
  } catch (err) {
    console.warn('rejected connect with WC: ', err);
  }
});

export default connect.reducer;
