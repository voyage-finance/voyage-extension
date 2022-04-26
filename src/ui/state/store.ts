import { configureStore } from '@reduxjs/toolkit';
import wc from './modules/connect';
import core from './modules/core';

export const getStore = async () => {
  const initialState = await globalThis.controller.getState();
  return configureStore({
    reducer: {
      wc,
      core,
    },
    preloadedState: {
      core: initialState,
    },
  });
};

export const store = configureStore({
  reducer: {
    wc,
    core,
  },
  preloadedState: {},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
