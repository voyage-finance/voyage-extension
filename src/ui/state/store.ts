import { configureStore } from '@reduxjs/toolkit';
import core, { updateState } from './modules/core';

export const initStore = async () => {
  const initialState = await globalThis.controller.getState();
  store.dispatch(updateState(initialState));
  return store;
};

export const store = configureStore({
  reducer: {
    core,
  },
  preloadedState: {},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
