/** Appointment type options */
export const APPOINTMENT_TYPES = [
  { value: 'Consultation', label: 'Consultation' },
  { value: 'Viewing', label: 'Product Viewing' },
  { value: 'Purchase', label: 'Purchase Assistance' },
  { value: 'Other', label: 'Other' },
]

/** Booking status enum values */
export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow',
}

/** Slot UI color map (Tailwind + hex) */
export const SLOT_COLORS = {
  AVAILABLE: {
    tailwind: 'bg-green-100 text-green-800 border-green-300',
    hex: '#22c55e',
    label: 'Available',
  },
  LIMITED: {
    tailwind: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hex: '#eab308',
    label: 'Limited',
  },
  FULL: {
    tailwind: 'bg-red-100 text-red-600 border-red-300',
    hex: '#ef4444',
    label: 'Full',
  },
  BLOCKED: {
    tailwind: 'bg-gray-200 text-gray-500 border-gray-300',
    hex: '#6b7280',
    label: 'Blocked',
  },
}

/** Reminder configuration options */
export const REMINDER_OPTIONS = {
  days: [1, 2, 3, 7],
  hours: [1, 2, 4, 12, 24],
}

/** Display date format used across the feature */
export const DATE_FORMAT = 'YYYY-MM-DD'

/** Display time format */
export const TIME_FORMAT = 'hh:mm A'

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
}

/** Slot status values returned by the API */
export const SLOT_STATUS = {
  AVAILABLE: 'Available',
  LIMITED: 'Limited',
  FULL: 'Full',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
}

/** Day-of-week labels */
export const DAY_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]
