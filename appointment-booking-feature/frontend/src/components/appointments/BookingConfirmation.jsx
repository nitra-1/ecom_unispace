'use client'

import { useRouter } from 'next/navigation'
import { formatBookingDate, formatTimeSlot } from '@/lib/appointmentHelpers'

/**
 * Displays a successful booking confirmation card with all booking details.
 * @param {{ booking: object }} props
 */
export default function BookingConfirmation({ booking }) {
  const router = useRouter()

  if (!booking) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Appointment Confirmed!
      </h2>
      <p className="text-gray-500 mb-6">
        Your booking has been successfully scheduled.
      </p>

      {/* Booking number pill */}
      <div className="inline-block px-6 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
        <span className="text-sm text-blue-600 font-medium">Booking Reference: </span>
        <span className="text-blue-800 font-bold">{booking.bookingNumber}</span>
      </div>

      {/* Details card */}
      <div className="bg-gray-50 rounded-xl p-6 text-left mb-6 space-y-3">
        <DetailRow label="Section" value={booking.sectionName} />
        <DetailRow
          label="Date"
          value={formatBookingDate(booking.slotDate)}
        />
        <DetailRow
          label="Time"
          value={formatTimeSlot(booking.startTime, booking.endTime)}
        />
        <DetailRow
          label="Appointment Type"
          value={booking.appointmentType}
        />
        <DetailRow
          label="Name"
          value={`${booking.firstName} ${booking.lastName}`}
        />
        <DetailRow label="Email" value={booking.email} />
        <DetailRow label="Phone" value={booking.phoneNumber} />
        {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
      </div>

      {/* Status badge */}
      <div className="mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
          ● {booking.bookingStatus || 'Confirmed'}
        </span>
      </div>

      {/* Info note */}
      <p className="text-sm text-gray-500 mb-8">
        A confirmation will be sent to{' '}
        <strong className="text-gray-700">{booking.email}</strong>.
        Please arrive 5 minutes before your scheduled time.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          🖨 Print / Download
        </button>
        <button
          onClick={() => router.push('/user/appointments')}
          className="px-6 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
        >
          View My Appointments
        </button>
        <button
          onClick={() => router.push('/appointments')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          Book Another
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
