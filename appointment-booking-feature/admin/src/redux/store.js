/**
 * Redux store — appointment admin panel (React 18 SPA).
 *
 * Uses redux-persist so the admin's selected section, fetched appointment list,
 * and slot data survive soft navigations and browser refreshes without needing
 * another round-trip to the API.
 *
 * Admin-panel pattern:
 *  - JWT is stored in localStorage (not cookies), so we use the default
 *    localStorage adapter from redux-persist.
 *  - Data is persisted under the key 'admin-appointment' to avoid collisions
 *    with the customer-facing Redux store if both run on the same origin.
 *
 * To add this slice to the main admin app store:
 *  1. Import appointmentAdminReducer from './features/appointmentAdminSlice'.
 *  2. Add it to the root combineReducers call.
 *  3. Add 'appointmentAdmin' to the persistConfig whitelist.
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
// Admin panel stores auth in localStorage, so use the default localStorage adapter
import storage from 'redux-persist/lib/storage'

import appointmentAdminReducer from './features/appointmentAdminSlice'

// ── Root reducer ───────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  // Accessed as state.appointmentAdmin.sections, state.appointmentAdmin.slots, etc.
  appointmentAdmin: appointmentAdminReducer,
})

// ── Persist configuration ──────────────────────────────────────────────────────
const persistConfig = {
  key: 'admin-appointment',   // localStorage key: "persist:admin-appointment"
  storage,
  // Whitelist only the slice we want to persist; 'loading' and 'error' are
  // intentionally excluded so they always start fresh after a page reload.
  whitelist: ['appointmentAdmin'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// ── Store ──────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Suppress redux-persist internal non-serializable action warnings
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // Enable Redux DevTools extension in development
  devTools: process.env.NODE_ENV !== 'production',
})

// ── Persistor ─────────────────────────────────────────────────────────────────
// Pass to <PersistGate> in the app's root to delay rendering until rehydration
// from localStorage is complete.
export const persistor = persistStore(store)
