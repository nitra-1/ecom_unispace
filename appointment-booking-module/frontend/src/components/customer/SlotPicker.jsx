'use client'
/**
 * SlotPicker.jsx
 *
 * Shows available time slots for a selected section and date.
 * Slots are colour-coded:
 *   Green  = available
 *   Amber  = limited (≥80% full)
 *   Red    = full
 *   Gray   = blocked (admin-blocked)
 *
 * Props:
 *   sectionId          – ID of the selected section
 *   selectedDate       – Date object (or null)
 *   onDateChange(date) – called when user changes the date
 *   selectedSlot       – the currently selected slot object (or null)
 *   onSelectSlot(slot) – called when user clicks a slot
 */

import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getSlots } from '../../api/appointmentApi'

// Tailwind classes per availability state
const SLOT_STYLES = {
  available: {
    base: 'border-green-400 bg-green-50 text-green-800 hover:bg-green-100',
    selected: 'border-green-600 bg-green-600 text-white shadow-md'
  },
  limited: {
    base: 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100',
    selected: 'border-amber-600 bg-amber-600 text-white shadow-md'
  },
  full: {
    base: 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed',
    selected: 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
  },
  blocked: {
    base: 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed',
    selected: 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
  }
}

export default function SlotPicker({
  sectionId,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSelectSlot
}) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Earliest selectable date is today
  const minDate = new Date()

  useEffect(() => {
    if (!sectionId || !selectedDate) {
      setSlots([])
      return
    }

    async function fetchSlots() {
      setLoading(true)
      setError(null)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const data = await getSlots(sectionId, dateStr)
        setSlots(data || [])
      } catch {
        setError('Failed to load time slots. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [sectionId, selectedDate])

  const isSelectableSlot = (slot) =>
    slot.availability === 'available' || slot.availability === 'limited'

  return (
    <div>
      {/* Date picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          minDate={minDate}
          dateFormat="dd/MM/yyyy"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          placeholderText="Choose date..."
        />
      </div>

      {/* Slot grid */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a Time Slot <span className="text-red-500">*</span>
          </label>

          {loading && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && !error && slots.length === 0 && (
            <p className="text-gray-500 text-sm">
              No slots available for this date. Please choose another date.
            </p>
          )}

          {!loading && !error && slots.length > 0 && (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-3 text-xs">
                <LegendItem colour="bg-green-500" label="Available" />
                <LegendItem colour="bg-amber-500" label="Limited" />
                <LegendItem colour="bg-red-400" label="Full" />
                <LegendItem colour="bg-gray-300" label="Blocked" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => {
                  const styles = SLOT_STYLES[slot.availability] || SLOT_STYLES.available
                  const isSelected = selectedSlot?.id === slot.id
                  const disabled = !isSelectableSlot(slot)

                  return (
                    <button
                      key={slot.id}
                      disabled={disabled}
                      onClick={() => !disabled && onSelectSlot(slot)}
                      className={`rounded-md border py-2 px-3 text-sm font-medium transition-colors
                        ${isSelected ? styles.selected : styles.base}`}
                    >
                      {slot.label}
                      {slot.availability === 'limited' && (
                        <span className="block text-xs opacity-75 mt-0.5">
                          {slot.remainingSlots} left
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LegendItem({ colour, label }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded-full ${colour}`} />
      {label}
    </span>
  )
}
