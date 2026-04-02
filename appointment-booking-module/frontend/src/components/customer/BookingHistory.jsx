'use client'
/**
 * BookingHistory.jsx
 *
 * Displays the logged-in customer's upcoming and past appointments
 * in a paginated table.
 *
 * Props:
 *   userId   – the authenticated user's ID
 *   onBook() – optional callback to open the booking modal
 */

import React, { useState } from 'react'
import useAppointments from '../../hooks/useAppointments'

const STATUS_BADGE = {
  Schedule: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Reschedule: 'bg-blue-100 text-blue-700',
  'In-Discussion': 'bg-purple-100 text-purple-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  'No-Show': 'bg-orange-100 text-orange-700'
}

export default function BookingHistory({ userId, onBook }) {
  const [pageIndex, setPageIndex] = useState(1)
  const pageSize = 10

  const { appointments, pagination, loading, error, cancelAppointment } = useAppointments({
    userId,
    pageIndex,
    pageSize
  })

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):') ?? ''
    const result = await cancelAppointment(id, reason)
    if (!result.success) alert(result.message)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">My Appointments</h3>
        {onBook && (
          <button
            onClick={onBook}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Book New
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500 font-medium">No appointments yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Schedule your first appointment to get started.
          </p>
          {onBook && (
            <button
              onClick={onBook}
              className="mt-4 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Book an Appointment
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && appointments.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Booking ID', 'Section', 'Date', 'Time', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-700 font-semibold">
                      {appt.booking_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {appt.section_name || appt.appointmentFor}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(appt.appointment_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {appt.appointment_time}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[appt.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!['Cancelled', 'Completed', 'No-Show'].includes(appt.status) && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pageIndex} of {pagination.pageCount}
              </span>
              <button
                onClick={() => setPageIndex((p) => Math.min(pagination.pageCount, p + 1))}
                disabled={pageIndex === pagination.pageCount}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return isNaN(d) ? dateString : d.toLocaleDateString('en-GB')
}
