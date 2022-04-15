import { configureStore } from '@reduxjs/toolkit';
import wc from '../containers/Connect/connectSlice';

export const store = configureStore({
  reducer: {
    wc,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
