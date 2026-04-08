/**
 * Redux store — appointment booking feature (Next.js 14 / React 18).
 *
 * Uses redux-persist so the appointment state (selected section, upcoming
 * appointments, etc.) survives page refreshes without extra server calls.
 *
 * Pattern matches the existing aparna-frontend-stagging Redux store so that
 * merging this slice into the main app requires only:
 *  1. Adding this slice's reducer to the root combineReducers call.
 *  2. Adding 'appointment' to the persistConfig whitelist (or use the
 *     combined store exported here as a standalone reference).
 *
 * Docs:
 *  - redux-persist: https://github.com/rt2zz/redux-persist
 *  - RTK: https://redux-toolkit.js.org/
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
// Next.js 14: use sessionStorage for appointment state so it clears on tab close.
// Switch to 'redux-persist/lib/storage' (localStorage) if you prefer persistence
// across sessions.
import storage from 'redux-persist/lib/storage/session'

import appointmentReducer from './features/appointmentSlice'

// ── Root reducer ───────────────────────────────────────────────────────────────
// Only one slice here; the main app's store.js will add this reducer alongside
// cart, user, etc. via combineReducers.
const rootReducer = combineReducers({
  // The 'appointment' key must match how the slice is accessed in selectors,
  // e.g. useSelector((state) => state.appointment.sections)
  appointment: appointmentReducer,
})

// ── Persist configuration ──────────────────────────────────────────────────────
// Whitelist specific keys to avoid persisting loading/error flags, which should
// always start fresh on page load.
const persistConfig = {
  key: 'appointment',   // localStorage / sessionStorage key prefix
  storage,
  // Only persist the parts of appointment state that are worth keeping between
  // navigations. Avoid persisting 'loading' and 'error' so they reset cleanly.
  whitelist: ['appointment'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// ── Store ──────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist dispatches non-serializable actions internally;
      // these must be ignored to prevent console warnings.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // Enable Redux DevTools in development for debugging
  devTools: process.env.NODE_ENV !== 'production',
})

// ── Persistor ─────────────────────────────────────────────────────────────────
// Passed to <PersistGate> in the Provider to delay rendering until rehydration
// from storage is complete.
export const persistor = persistStore(store)
