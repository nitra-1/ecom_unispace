import { SLOT_COLORS, DATE_FORMAT, TIME_FORMAT } from '@/utils/appointmentConstants'

/**
 * Formats a slot date for display.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD or full ISO)
 * @returns {string} Formatted date, e.g. "Thursday, 10 April 2026"
 */
export function formatBookingDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Formats a time range for display.
 * @param {string} startTime - HH:mm or HH:mm:ss
 * @param {string} endTime - HH:mm or HH:mm:ss
 * @returns {string} e.g. "10:00 AM – 10:30 AM"
 */
export function formatTimeSlot(startTime, endTime) {
  if (!startTime) return ''
  const fmt = (t) => {
    try {
      const [h, m] = t.split(':').map(Number)
      const date = new Date(2000, 0, 1, h, m)
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return t
    }
  }
  if (!endTime) return fmt(startTime)
  return `${fmt(startTime)} – ${fmt(endTime)}`
}

/**
 * Returns Tailwind CSS classes for a slot button based on availability.
 * @param {{ availableCapacity: number, totalCapacity: number, isBlocked: boolean, slotStatus: string }} slot
 * @returns {string} Tailwind class string
 */
export function getSlotColorClass(slot) {
  if (!slot) return 'bg-gray-100 text-gray-400 border-gray-200'

  if (slot.isBlocked || slot.slotStatus === 'Blocked') {
    return 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
  }
  if (slot.availableCapacity === 0 || slot.slotStatus === 'Full') {
    return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed'
  }

  const ratio = slot.availableCapacity / slot.totalCapacity
  if (ratio > 0.5) {
    return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
  }
  return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
}

/**
 * Calculates remaining capacity as a percentage.
 * @param {number} available
 * @param {number} total
 * @returns {number} 0–100
 */
export function calculateRemainingSlots(available, total) {
  if (!total || total === 0) return 0
  return Math.round((available / total) * 100)
}

/**
 * Formats a booking number for display, ensuring it has the APT- prefix.
 * @param {string} rawNumber
 * @returns {string}
 */
export function formatBookingNumber(rawNumber) {
  if (!rawNumber) return ''
  if (rawNumber.startsWith('APT-')) return rawNumber
  return `APT-${rawNumber}`
}

/**
 * Groups an array of slots by their start hour for display.
 * @param {object[]} slots
 * @returns {Record<string, object[]>} e.g. { "10:00 AM": [...], "10:30 AM": [...] }
 */
export function groupSlotsByHour(slots) {
  if (!slots || slots.length === 0) return {}

  return slots.reduce((groups, slot) => {
    if (!slot.startTime) return groups
    try {
      const [h] = slot.startTime.split(':').map(Number)
      const date = new Date(2000, 0, 1, h)
      const hourLabel = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        hour12: true,
      })
      if (!groups[hourLabel]) {
        groups[hourLabel] = []
      }
      groups[hourLabel].push(slot)
    } catch {
      // skip malformed slots
    }
    return groups
  }, {})
}

/**
 * Returns a short label for the slot status.
 * @param {object} slot
 * @returns {'Available'|'Limited'|'Full'|'Blocked'|'Completed'}
 */
export function getSlotStatusLabel(slot) {
  if (!slot) return 'Unknown'
  if (slot.isBlocked) return 'Blocked'
  if (slot.slotStatus) return slot.slotStatus
  if (slot.availableCapacity === 0) return 'Full'
  const ratio = slot.availableCapacity / slot.totalCapacity
  if (ratio > 0.5) return 'Available'
  return 'Limited'
}
