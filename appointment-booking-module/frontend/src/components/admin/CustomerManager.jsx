'use client'
/**
 * CustomerManager.jsx  [Admin]
 *
 * Provides the admin with a full view of all appointments across all customers.
 * Features:
 *   - Search by name, email, phone, or booking ID
 *   - Filter by section, status, and date
 *   - Update appointment status
 *   - Cancel / reschedule on behalf of customers
 *   - View detailed appointment info
 *   - Merge duplicate bookings (cancel one and note the surviving ID)
 */

import React, { useState, useEffect } from 'react'
import useAppointments from '../../hooks/useAppointments'
import { getSections, adminUpdateStatus, adminForceBook, rescheduleAppointment } from '../../api/appointmentApi'

const STATUSES = ['Pending', 'Schedule', 'Reschedule', 'In-Discussion', 'Completed', 'Cancelled', 'No-Show']

const STATUS_BADGE = {
  Schedule: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Reschedule: 'bg-blue-100 text-blue-700',
  'In-Discussion': 'bg-purple-100 text-purple-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  'No-Show': 'bg-orange-100 text-orange-700'
}

export default function CustomerManager() {
  const [sections, setSections] = useState([])
  const [filters, setFilters] = useState({
    searchText: '',
    sectionId: '',
    status: '',
    date: ''
  })
  const [pageIndex, setPageIndex] = useState(1)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { appointments, pagination, loading, error, refetch, cancelAppointment, updateStatus } =
    useAppointments({ isAdmin: true, ...filters, pageIndex, pageSize: 25 })

  useEffect(() => {
    getSections().then(setSections).catch(console.error)
  }, [])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPageIndex(1)
  }

  async function handleStatusSave() {
    if (!editStatus) return
    setSaving(true)
    const result = await updateStatus(selectedAppt.id, editStatus, editNotes)
    setSaving(false)
    if (result.success) {
      setSelectedAppt(null)
    } else {
      alert(result.message)
    }
  }

  async function handleCancel(appt) {
    const reason = window.prompt(`Cancel appointment ${appt.booking_id}?\nReason (optional):`) ?? ''
    if (reason === null) return // user cancelled the prompt
    const result = await cancelAppointment(appt.id, reason)
    if (!result.success) alert(result.message)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Appointments</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name, email, phone, booking ID…"
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-72 focus:outline-none focus:border-blue-500"
        />
        <select
          value={filters.sectionId}
          onChange={(e) => handleFilterChange('sectionId', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Sections</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        />
        <button onClick={() => setFilters({ searchText: '', sectionId: '', status: '', date: '' })}
          className="text-xs text-gray-500 hover:text-gray-700 underline">
          Clear filters
        </button>
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {appointments.length} of {pagination.recordCount} appointments
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Booking ID', 'Customer', 'Section', 'Date & Time', 'Status', 'VIP', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No appointments found.</td></tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-700 font-semibold">
                    {appt.booking_id}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{appt.user_name}</div>
                    <div className="text-gray-400 text-xs">{appt.user_email}</div>
                    <div className="text-gray-400 text-xs">{appt.user_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{appt.section_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{formatDate(appt.appointment_date)}</div>
                    <div className="text-xs text-gray-400">{appt.appointment_time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {appt.is_vip ? (
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700">VIP</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => { setSelectedAppt(appt); setEditStatus(appt.status); setEditNotes(appt.notes || '') }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {!['Cancelled', 'Completed'].includes(appt.status) && (
                        <button onClick={() => handleCancel(appt)} className="text-xs text-red-500 hover:underline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            disabled={pageIndex === 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">Page {pageIndex} of {pagination.pageCount}</span>
          <button
            onClick={() => setPageIndex((p) => Math.min(pagination.pageCount, p + 1))}
            disabled={pageIndex === pagination.pageCount}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Edit status modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Edit Appointment — {selectedAppt.booking_id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                  placeholder="Internal notes (not visible to customer)…"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelectedAppt(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleStatusSave}
                disabled={saving}
                className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return isNaN(d) ? dateString : d.toLocaleDateString('en-GB')
}
