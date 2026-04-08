'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { appointmentApi } from '@/lib/appointmentApi'
import { formatBookingDate, formatTimeSlot } from '@/lib/appointmentHelpers'
import { BOOKING_STATUS } from '@/utils/appointmentConstants'

/**
 * User booking detail page at /user/appointments/[bookingId].
 * Shows full booking info with cancel and reschedule actions.
 */
export default function UserBookingDetailPage() {
  const { bookingId } = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth || {})

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)

  useEffect(() => {
    if (!bookingId) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await appointmentApi.getBookingById(bookingId)
        if (res?.success) {
          setBooking(res.data)
        } else {
          setError(res?.message || 'Booking not found')
        }
      } catch {
        setError('Failed to load booking.')
      } finally {
        setLoading(false)
      }
    })()
  }, [bookingId])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    try {
      setActionLoading(true)
      const res = await appointmentApi.cancelBooking(bookingId)
      if (res?.success) {
        setBooking((prev) => ({ ...prev, bookingStatus: 'Cancelled' }))
        setActionMessage('Appointment cancelled successfully.')
      } else {
        setActionMessage(res?.message || 'Failed to cancel.')
      }
    } catch {
      setActionMessage('Failed to cancel appointment.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReschedule = () => {
    router.push(`/appointments?reschedule=${bookingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/user/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to My Appointments
          </button>
        </div>
      </div>
    )
  }

  const isCancellable =
    booking?.bookingStatus === BOOKING_STATUS.CONFIRMED ||
    booking?.bookingStatus === BOOKING_STATUS.PENDING

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => router.push('/user/appointments')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to My Appointments
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Booking #{booking?.bookingNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking?.bookingStatus === 'Confirmed'
                  ? 'bg-green-100 text-green-700'
                  : booking?.bookingStatus === 'Cancelled'
                  ? 'bg-red-100 text-red-700'
                  : booking?.bookingStatus === 'Completed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {booking?.bookingStatus}
            </span>
          </div>

          {actionMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {actionMessage}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-4 mb-8">
            {[
              ['Section', booking?.sectionName],
              ['Date', formatBookingDate(booking?.slotDate)],
              ['Time', formatTimeSlot(booking?.startTime, booking?.endTime)],
              ['Type', booking?.appointmentType],
              ['Name', `${booking?.firstName} ${booking?.lastName}`],
              ['Email', booking?.email],
              ['Phone', booking?.phoneNumber],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>

          {booking?.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          {isCancellable && (
            <div className="flex gap-3">
              <button
                onClick={handleReschedule}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
