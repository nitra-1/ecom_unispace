'use client'
/**
 * Redux Provider wrapper for Next.js 14 App Router.
 *
 * Next.js 14 App Router renders components on the server by default.
 * Redux Provider uses React context which is client-only, so this file
 * must be marked with 'use client' to run in the browser.
 *
 * Usage — wrap the appointment section of the layout (or the root layout):
 *
 *   // app/appointments/layout.jsx
 *   import { AppointmentProvider } from '@/redux/provider'
 *   export default function Layout({ children }) {
 *     return <AppointmentProvider>{children}</AppointmentProvider>
 *   }
 *
 * PersistGate delays rendering until redux-persist has finished rehydrating
 * the store from sessionStorage, preventing a flash of empty state.
 */

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'

/**
 * Wraps children with the Redux store provider and the redux-persist gate.
 * @param {{ children: React.ReactNode }} props
 */
export function AppointmentProvider({ children }) {
  return (
    <Provider store={store}>
      {/*
        PersistGate delays UI rendering until the persisted state is loaded.
        loading={null} means nothing is shown during the rehydration phase
        (swap for a Skeleton/spinner if you prefer).
      */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
