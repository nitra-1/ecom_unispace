'use client'

import { useState } from 'react'
import { useAppointmentSlots } from '@/hooks/useAppointmentSlots'
import { formatTimeSlot, getSlotColorClass, groupSlotsByHour } from '@/lib/appointmentHelpers'

/**
 * Date picker + color-coded slot grid for a given section.
 * @param {{ sectionId: number, onSlotSelect: (slot: object) => void }} props
 */
export default function SlotSelector({ sectionId, onSlotSelect }) {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlotId, setSelectedSlotId] = useState(null)

  const { slots, loading, error, refetch } = useAppointmentSlots(sectionId, selectedDate)

  const slotsByHour = groupSlotsByHour(slots)

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setSelectedSlotId(null)
  }

  const handleSlotClick = (slot) => {
    if (slot.isBlocked || slot.availableCapacity === 0) return
    setSelectedSlotId(slot.slotId)
    onSlotSelect(slot)
  }

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div>
        <label
          htmlFor="slot-date"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Date
        </label>
        <input
          id="slot-date"
          type="date"
          value={selectedDate}
          min={today}
          onChange={handleDateChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <button
          onClick={refetch}
          className="ml-3 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: 'bg-green-500', label: 'Available' },
          { color: 'bg-yellow-400', label: 'Limited' },
          { color: 'bg-red-400', label: 'Full' },
          { color: 'bg-gray-300', label: 'Blocked' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-gray-600">
            <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Slot grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Failed to load slots: {error}</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No slots available for this date. Please try another date.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByHour).map(([hour, hourSlots]) => (
            <div key={hour}>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                {hour}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hourSlots.map((slot) => {
                  const colorClass = getSlotColorClass(slot)
                  const isSelected = selectedSlotId === slot.slotId
                  const isDisabled = slot.isBlocked || slot.availableCapacity === 0

                  return (
                    <button
                      key={slot.slotId}
                      onClick={() => handleSlotClick(slot)}
                      disabled={isDisabled}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all
                        ${colorClass}
                        ${isSelected ? 'ring-2 ring-offset-2 ring-blue-600 border-blue-600' : ''}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                      `}
                    >
                      <span className="font-semibold">
                        {formatTimeSlot(slot.startTime, slot.endTime)}
                      </span>
                      <span className="text-xs mt-1 opacity-75">
                        {slot.isBlocked
                          ? 'Blocked'
                          : `${slot.availableCapacity} left`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
