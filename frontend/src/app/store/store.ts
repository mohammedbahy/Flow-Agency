import { configureStore } from '@reduxjs/toolkit';

/**
 * Global Redux store. Sprint 0 ships an empty reducer map on purpose —
 * feature slices (e.g. `features/authentication/store/*`) register here
 * as Sprint 1 lands. Keep local UI state local; don't put everything in Redux.
 */
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
