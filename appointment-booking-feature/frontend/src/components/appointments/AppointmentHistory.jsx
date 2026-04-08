'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { appointmentApi } from '@/lib/appointmentApi'
import { formatBookingDate, formatTimeSlot } from '@/lib/appointmentHelpers'
import { BOOKING_STATUS } from '@/utils/appointmentConstants'

const PAGE_SIZE = 10

/**
 * Paginated list of past customer appointments.
 * @param {{ customerId: string }} props
 */
export default function AppointmentHistory({ customerId }) {
  const router = useRouter()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!customerId) return
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, page])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await appointmentApi.getCustomerBookings()
      if (res?.success) {
        const all = res.data || []
        setTotal(all.length)
        // Client-side pagination
        setAppointments(all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
      } else {
        setError(res?.message || 'Failed to load appointments')
      }
    } catch {
      setError('Failed to load appointment history.')
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (status) => {
    const map = {
      [BOOKING_STATUS.CONFIRMED]: 'bg-green-100 text-green-700',
      [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
      [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
      [BOOKING_STATUS.COMPLETED]: 'bg-blue-100 text-blue-700',
      [BOOKING_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-600',
    }
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          map[status] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {status}
      </span>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {error}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No past appointments</p>
        <button
          onClick={() => router.push('/appointments')}
          className="text-blue-600 hover:underline text-sm"
        >
          Book your first appointment →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {appointments.map((appt) => (
          <button
            key={appt.bookingId}
            onClick={() => router.push(`/user/appointments/${appt.bookingId}`)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-0.5">
                  {appt.sectionName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatBookingDate(appt.slotDate)} ·{' '}
                  {formatTimeSlot(appt.startTime, appt.endTime)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  #{appt.bookingNumber} · {appt.appointmentType}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {statusBadge(appt.bookingStatus)}
                <span className="text-xs text-blue-600">View →</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40 text-sm hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 text-sm hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
