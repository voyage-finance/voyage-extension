import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  connected: boolean;
  session?: WalletConnectSession;
}

const initialState: ConnectionState = {
  connected: false,
};

const connectSlice = createSlice({
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

export const connectWithWC = createAsyncThunk<WalletConnectSession, string>(
  'wc/connect',
  async (uri: string) => {
    return await globalThis.controller.connectWithWC(uri);
  }
);

export default connectSlice.reducer;
