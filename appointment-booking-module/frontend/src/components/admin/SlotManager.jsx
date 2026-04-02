'use client'
/**
 * SlotManager.jsx  [Admin]
 *
 * Allows admins to:
 *   - Select a section and date range to auto-generate slots
 *   - View the slot grid for any section + date
 *   - Block or unblock individual slots
 *   - Set salesperson capacity overrides per slot
 *
 * Prerequisites: Run slot generation at least once before slots will appear.
 */

import React, { useState, useEffect } from 'react'
import {
  getSections,
  getSlots,
  adminGenerateSlots,
  adminBlockSlot,
  adminUnblockSlot,
  adminSetCapacity
} from '../../api/appointmentApi'

const AVAILABILITY_COLOURS = {
  available: 'bg-green-100 border-green-400 text-green-800',
  limited: 'bg-amber-100 border-amber-400 text-amber-800',
  full: 'bg-red-100 border-red-300 text-red-600',
  blocked: 'bg-gray-200 border-gray-300 text-gray-500 line-through'
}

export default function SlotManager() {
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  // Generate form
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().split('T')[0])
  const [genEndDate, setGenEndDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genMessage, setGenMessage] = useState(null)
  // Capacity editor
  const [editingSlot, setEditingSlot] = useState(null)
  const [newCapacity, setNewCapacity] = useState(1)
  const [savingCapacity, setSavingCapacity] = useState(false)

  useEffect(() => {
    getSections().then(setSections).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedSectionId || !viewDate) return
    loadSlots()
  }, [selectedSectionId, viewDate])

  async function loadSlots() {
    setSlotsLoading(true)
    try {
      const data = await getSlots(selectedSectionId, viewDate)
      setSlots(data)
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  async function handleGenerate() {
    if (!selectedSectionId || !genStartDate || !genEndDate) {
      alert('Please select a section and date range.')
      return
    }
    setGenerating(true)
    setGenMessage(null)
    try {
      const result = await adminGenerateSlots({
        sectionId: selectedSectionId,
        startDate: genStartDate,
        endDate: genEndDate
      })
      setGenMessage({ type: 'success', text: result.message })
      await loadSlots()
    } catch (err) {
      setGenMessage({ type: 'error', text: err.response?.data?.message || 'Generation failed.' })
    } finally {
      setGenerating(false)
    }
  }

  async function handleBlock(slotId) {
    await adminBlockSlot(slotId)
    await loadSlots()
  }

  async function handleUnblock(slotId) {
    await adminUnblockSlot(slotId)
    await loadSlots()
  }

  async function saveCapacity() {
    setSavingCapacity(true)
    try {
      await adminSetCapacity(selectedSectionId, {
        date: viewDate,
        hour_start: editingSlot.startTime,
        salesperson_count: newCapacity
      })
      setEditingSlot(null)
      await loadSlots()
    } catch {
      alert('Failed to update capacity.')
    } finally {
      setSavingCapacity(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">Slot Manager</h2>

      {/* Section selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">— Select a section —</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ── Slot Generation ── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="font-semibold text-blue-800 mb-3">Auto-Generate Slots</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-blue-700 mb-1">Start Date</label>
            <input type="date" value={genStartDate} onChange={(e) => setGenStartDate(e.target.value)}
              className="rounded border border-blue-200 px-3 py-1.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">End Date</label>
            <input type="date" value={genEndDate} onChange={(e) => setGenEndDate(e.target.value)}
              className="rounded border border-blue-200 px-3 py-1.5 text-sm focus:outline-none" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedSectionId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate Slots'}
          </button>
        </div>
        {genMessage && (
          <p className={`mt-3 text-sm ${genMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
            {genMessage.text}
          </p>
        )}
      </div>

      {/* ── Slot Grid ── */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="font-semibold text-gray-800">Slot Availability</h3>
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
          {[['bg-green-400', 'Available'], ['bg-amber-400', 'Limited'], ['bg-red-400', 'Full'], ['bg-gray-400', 'Blocked']].map(
            ([cls, label]) => (
              <span key={label} className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full ${cls}`} /> {label}
              </span>
            )
          )}
        </div>

        {slotsLoading && <p className="text-gray-400 text-sm">Loading slots…</p>}

        {!slotsLoading && slots.length === 0 && (
          <p className="text-gray-500 text-sm">
            No slots found. Generate slots for this section first.
          </p>
        )}

        {!slotsLoading && slots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-lg border p-3 ${AVAILABILITY_COLOURS[slot.availability]}`}
              >
                <div className="font-medium text-sm">{slot.label}</div>
                <div className="text-xs mt-1">
                  {slot.currentBookings}/{slot.maxBookings} booked
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {slot.status === 'blocked' ? (
                    <button onClick={() => handleUnblock(slot.id)} className="text-xs bg-white border rounded px-2 py-0.5 hover:bg-gray-50">
                      Unblock
                    </button>
                  ) : (
                    <button onClick={() => handleBlock(slot.id)} className="text-xs bg-white border rounded px-2 py-0.5 hover:bg-gray-50">
                      Block
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingSlot(slot); setNewCapacity(slot.maxBookings) }}
                    className="text-xs bg-white border rounded px-2 py-0.5 hover:bg-gray-50"
                  >
                    Capacity
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capacity modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Set Capacity — {editingSlot.label}
            </h3>
            <label className="block text-sm text-gray-700 mb-2">
              Number of Salespersons
            </label>
            <input
              type="number"
              min={1}
              value={newCapacity}
              onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
            />
            <p className="mt-2 text-xs text-gray-400">
              Max bookings per hour = salesperson count.
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditingSlot(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={saveCapacity}
                disabled={savingCapacity}
                className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingCapacity ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
