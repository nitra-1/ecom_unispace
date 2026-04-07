'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { appointmentApi } from '@/lib/appointmentApi'
import { formatBookingDate, formatTimeSlot } from '@/lib/appointmentHelpers'
import { BOOKING_STATUS } from '@/utils/appointmentConstants'

/**
 * Shows upcoming appointments for the authenticated customer with a countdown.
 * @param {{ customerId: string }} props
 */
export default function UpcomingAppointments({ customerId }) {
  const router = useRouter()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!customerId) return
    fetchUpcoming()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const fetchUpcoming = async () => {
    try {
      setLoading(true)
      const res = await appointmentApi.getCustomerBookings()
      if (res?.success) {
        const now = new Date()
        const upcoming = (res.data || []).filter((a) => {
          const apptDate = new Date(`${a.slotDate}T${a.startTime}`)
          return (
            apptDate > now &&
            (a.bookingStatus === BOOKING_STATUS.CONFIRMED ||
              a.bookingStatus === BOOKING_STATUS.PENDING)
          )
        })
        upcoming.sort(
          (a, b) =>
            new Date(`${a.slotDate}T${a.startTime}`) -
            new Date(`${b.slotDate}T${b.startTime}`)
        )
        setAppointments(upcoming)
      }
    } catch {
      // silently fail — history component shows the error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId, e) => {
    e.stopPropagation()
    if (!confirm('Cancel this appointment?')) return
    try {
      setCancellingId(bookingId)
      const res = await appointmentApi.cancelBooking(bookingId)
      if (res?.success) {
        setAppointments((prev) =>
          prev.filter((a) => a.bookingId !== bookingId)
        )
      }
    } catch {
      // ignore
    } finally {
      setCancellingId(null)
    }
  }

  /**
   * Returns a human-readable countdown string to the appointment.
   */
  const getCountdown = (slotDate, startTime) => {
    const apptDate = new Date(`${slotDate}T${startTime}`)
    const diffMs = apptDate - Date.now()
    if (diffMs <= 0) return 'Now'
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h away`
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${mins}m away`
    return `${mins}m away`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-xl text-center">
        <p className="text-gray-500 mb-3">No upcoming appointments</p>
        <button
          onClick={() => router.push('/appointments')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => (
        <div
          key={appt.bookingId}
          onClick={() => router.push(`/user/appointments/${appt.bookingId}`)}
          className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-sm hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                <p className="font-semibold text-gray-900">{appt.sectionName}</p>
              </div>
              <p className="text-sm text-gray-600">
                {formatBookingDate(appt.slotDate)} ·{' '}
                {formatTimeSlot(appt.startTime, appt.endTime)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                #{appt.bookingNumber} · {appt.appointmentType}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {getCountdown(appt.slotDate, appt.startTime)}
              </span>

              {/* Reminder info */}
              {appt.reminderSent && (
                <span className="text-xs text-gray-400">✉ Reminder sent</span>
              )}

              {/* Cancel button */}
              <button
                onClick={(e) => handleCancel(appt.bookingId, e)}
                disabled={cancellingId === appt.bookingId}
                className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {cancellingId === appt.bookingId ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
