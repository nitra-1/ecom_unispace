/**
 * useSignalR — React hook for connecting to the AppointmentHub SignalR hub.
 *
 * Establishes a persistent WebSocket connection to /hubs/appointment and
 * lets callers subscribe to named events (SlotBlocked, BookingCreated, etc.).
 *
 * The JWT is passed in the query string because browsers cannot set custom
 * headers on WebSocket upgrades. The backend handles this via JwtBearerEvents
 * (see Program.cs OnMessageReceived).
 *
 * Usage:
 *   const { connection, isConnected } = useSignalR({
 *     sectionId: selectedSection?.sectionId,
 *     handlers: {
 *       BookingCreated: (booking) => dispatch(addBooking(booking)),
 *       SlotBlocked:    (data)    => dispatch(updateSlotInList({ slotId: data.slotId, changes: { slotStatus: 'Blocked' } })),
 *       SlotUnblocked:  (data)    => refetch(),
 *     },
 *   })
 */

import { useEffect, useRef, useState } from 'react'
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
import { getUserToken } from '@/lib/GetBaseUrl'

const HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_URL ?? 'https://api.aparna.hashtechy.space/hubs/appointment'

/**
 * @param {{ sectionId?: number, handlers?: Record<string, (data: unknown) => void> }} options
 * @returns {{ connection: import('@microsoft/signalr').HubConnection|null, isConnected: boolean }}
 */
export function useSignalR({ sectionId, handlers = {} } = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef(null)

  useEffect(() => {
    const token = getUserToken()

    // Build the hub connection with automatic reconnect
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Pass JWT as query param — backend reads it in JwtBearerEvents.OnMessageReceived
        accessTokenFactory: () => token ?? '',
        // Prefer WebSockets, fall back to Server-Sent Events and Long Polling
        transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        process.env.NODE_ENV === 'production' ? LogLevel.Warning : LogLevel.Information
      )
      .build()

    connectionRef.current = connection

    // Register all event handlers passed by the caller
    Object.entries(handlers).forEach(([event, handler]) => {
      connection.on(event, handler)
    })

    // Lifecycle callbacks
    connection.onreconnecting(() => setIsConnected(false))
    connection.onreconnected(() => setIsConnected(true))
    connection.onclose(() => setIsConnected(false))

    // Start connection, then join the section group if a sectionId was provided
    connection
      .start()
      .then(async () => {
        setIsConnected(true)
        if (sectionId) {
          await connection.invoke('JoinSectionGroup', sectionId)
        }
      })
      .catch((err) => {
        console.error('[SignalR] Connection failed:', err)
      })

    // Cleanup: leave group and stop connection when the component unmounts
    return () => {
      if (sectionId && connection.state === 'Connected') {
        connection.invoke('LeaveSectionGroup', sectionId).catch(() => {})
      }
      connection.stop().catch(() => {})
    }
    // Intentionally omitting `handlers` from deps to avoid re-creating the
    // connection on every render — callers should memoize their handler objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId])

  return {
    connection: connectionRef.current,
    isConnected,
  }
}

export default useSignalR
