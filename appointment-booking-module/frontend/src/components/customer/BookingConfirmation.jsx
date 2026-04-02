'use client'
/**
 * BookingConfirmation.jsx
 *
 * Shown after a successful booking.
 * Displays the booking ID, section, date, and time.
 *
 * Props:
 *   booking       – the booking object returned by the API
 *   onClose()     – called when the user clicks "Done"
 *   onViewHistory() – navigates to booking history
 */

import React from 'react'

export default function BookingConfirmation({ booking, onClose, onViewHistory }) {
  if (!booking) return null

  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      {/* Success icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-8 w-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Appointment Confirmed!</h2>
      <p className="text-gray-500 mb-6">
        A confirmation email has been sent to <strong>{booking.user_email}</strong>.
      </p>

      {/* Booking details card */}
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-5 text-left space-y-3">
        <DetailRow label="Booking ID" value={booking.booking_id} highlight />
        <DetailRow label="Section" value={booking.section_name || booking.appointmentFor} />
        <DetailRow label="Date" value={formatDate(booking.appointment_date)} />
        <DetailRow label="Time" value={booking.appointment_time} />
        <DetailRow label="Status" value={booking.status} />
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Please quote your Booking ID at the reception desk.
      </p>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="flex-1 rounded-lg border border-blue-500 py-2.5 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            View All Appointments
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-blue-700 font-bold text-base' : 'text-gray-800'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return isNaN(d) ? dateString : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
