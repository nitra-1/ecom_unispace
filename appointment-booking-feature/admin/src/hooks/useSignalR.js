/**
 * useSignalR — SignalR hook for the admin panel.
 *
 * Connects to the AppointmentHub and allows the admin dashboard to receive
 * real-time push notifications when bookings or slots change.
 *
 * JWT is read from localStorage (admin panel auth model) and passed to the
 * hub via query string because WebSocket upgrades cannot carry custom headers.
 *
 * Usage in an admin component:
 *   const { isConnected } = useSignalR({
 *     isAdmin: true,
 *     handlers: {
 *       BookingCreated:    (booking) => dispatch(setAppointments(...)),
 *       BookingCancelled:  (id)      => dispatch(updateAppointmentStatus({ bookingId: id, bookingStatus: 'Cancelled' })),
 *       BookingRescheduled:(booking) => dispatch(updateAppointmentStatus({ bookingId: booking.bookingId, bookingStatus: booking.bookingStatus })),
 *       SlotBlocked:       (data)    => dispatch(updateSlotInList({ slotId: data.slotId, changes: { slotStatus: 'Blocked' } })),
 *       SlotUnblocked:     (data)    => dispatch(updateSlotInList({ slotId: data.slotId, changes: { slotStatus: 'Available' } })),
 *     },
 *   })
 */

import { useEffect, useRef, useState } from 'react'
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'

const HUB_URL =
  process.env.REACT_APP_SIGNALR_URL ?? 'https://api.aparna.hashtechy.space/hubs/appointment'

/**
 * @param {{
 *   sectionId?: number,
 *   isAdmin?: boolean,
 *   handlers?: Record<string, (data: unknown) => void>
 * }} options
 * @returns {{ isConnected: boolean }}
 */
export function useSignalR({ sectionId, isAdmin = false, handlers = {} } = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef(null)

  // Keep a stable ref to the latest handlers so registered callbacks always
  // see the most recent state/dispatch without recreating the connection.
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    // Admin panel stores JWT in localStorage
    const token = localStorage.getItem('token')

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Pass JWT as query param so backend can authenticate the WebSocket
        accessTokenFactory: () => token ?? '',
        transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        process.env.NODE_ENV === 'production' ? LogLevel.Warning : LogLevel.Information
      )
      .build()

    connectionRef.current = connection

    // Register each event by forwarding through the ref to avoid stale closures.
    const registeredEvents = Object.keys(handlers)
    registeredEvents.forEach((event) => {
      connection.on(event, (...args) => {
        handlersRef.current[event]?.(...args)
      })
    })

    connection.onreconnecting(() => setIsConnected(false))
    connection.onreconnected(() => setIsConnected(true))
    connection.onclose(() => setIsConnected(false))

    connection
      .start()
      .then(async () => {
        setIsConnected(true)

        // Admin users join the "admin" group to receive all booking events
        if (isAdmin) {
          await connection.invoke('JoinAdminGroup').catch(() => {
            // May fail if the token lacks the Admin role — silently ignore
          })
        }

        // Optionally also subscribe to a specific section's slot updates
        if (sectionId) {
          await connection.invoke('JoinSectionGroup', sectionId).catch(() => {})
        }
      })
      .catch((err) => {
        console.error('[SignalR Admin] Connection failed:', err)
      })

    return () => {
      connection.stop().catch(() => {})
    }
    // Connection is re-created only when sectionId or isAdmin changes.
    // handlers are kept fresh via handlersRef so they don't need to be a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, isAdmin])

  return { isConnected }
}

export default useSignalR
