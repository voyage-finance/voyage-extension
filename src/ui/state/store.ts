import { configureStore } from '@reduxjs/toolkit';
import wc from './modules/connect';
import core from './modules/core';

export const store = configureStore({
  reducer: {
    wc,
    core,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
