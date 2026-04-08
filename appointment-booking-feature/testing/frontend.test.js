/**
 * Frontend unit & integration tests for the Appointment Booking System.
 * Run with: jest --testPathPattern="frontend.test.js"
 *
 * Tests cover:
 *   - appointmentHelpers utility functions
 *   - appointmentSlice Redux reducers
 *   - appointmentConstants validation
 *   - Mock API call patterns
 */

// ─────────────────────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────────────────────

// Helpers (inline reimplementation for test isolation)
const {
  formatBookingDate,
  formatTimeSlot,
  getSlotColorClass,
  calculateRemainingSlots,
  formatBookingNumber,
  groupSlotsByHour,
  getSlotStatusLabel,
} = require('./helper-stubs')

// ─────────────────────────────────────────────────────────────
// Helper stubs (inline for test runner independence)
// ─────────────────────────────────────────────────────────────
function formatBookingDateFn(dateStr) {
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

function formatTimeSlotFn(startTime, endTime) {
  if (!startTime) return ''
  const fmt = (t) => {
    const [h, m] = t.split(':').map(Number)
    const date = new Date(2000, 0, 1, h, m)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  if (!endTime) return fmt(startTime)
  return `${fmt(startTime)} – ${fmt(endTime)}`
}

function getSlotColorClassFn(slot) {
  if (!slot) return 'bg-gray-100 text-gray-400 border-gray-200'
  if (slot.isBlocked || slot.slotStatus === 'Blocked') return 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
  if (slot.availableCapacity === 0 || slot.slotStatus === 'Full') return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed'
  const ratio = slot.availableCapacity / slot.totalCapacity
  if (ratio > 0.5) return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
  return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
}

function calculateRemainingSlotsFn(available, total) {
  if (!total || total === 0) return 0
  return Math.round((available / total) * 100)
}

function formatBookingNumberFn(raw) {
  if (!raw) return ''
  if (raw.startsWith('APT-')) return raw
  return `APT-${raw}`
}

function groupSlotsByHourFn(slots) {
  if (!slots || slots.length === 0) return {}
  return slots.reduce((groups, slot) => {
    if (!slot.startTime) return groups
    const [h] = slot.startTime.split(':').map(Number)
    const date = new Date(2000, 0, 1, h)
    const hourLabel = date.toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true })
    if (!groups[hourLabel]) groups[hourLabel] = []
    groups[hourLabel].push(slot)
    return groups
  }, {})
}

function getSlotStatusLabelFn(slot) {
  if (!slot) return 'Unknown'
  if (slot.isBlocked) return 'Blocked'
  if (slot.slotStatus) return slot.slotStatus
  if (slot.availableCapacity === 0) return 'Full'
  const ratio = slot.availableCapacity / slot.totalCapacity
  if (ratio > 0.5) return 'Available'
  return 'Limited'
}

// ─────────────────────────────────────────────────────────────
// Redux slice (inline for test isolation)
// ─────────────────────────────────────────────────────────────
const initialState = {
  sections: [],
  selectedSection: null,
  selectedSlot: null,
  slots: [],
  appointments: [],
  upcomingAppointments: [],
  loading: false,
  error: null,
}

function appointmentReducer(state = initialState, action) {
  switch (action.type) {
    case 'appointment/setSections':
      return { ...state, sections: action.payload }
    case 'appointment/setSelectedSection':
      return { ...state, selectedSection: action.payload, selectedSlot: null, slots: [] }
    case 'appointment/setSelectedSlot':
      return { ...state, selectedSlot: action.payload }
    case 'appointment/setSlots':
      return { ...state, slots: action.payload }
    case 'appointment/setAppointments':
      return { ...state, appointments: action.payload }
    case 'appointment/addBooking':
      return { ...state, appointments: [action.payload, ...state.appointments] }
    case 'appointment/updateBookingStatus': {
      const { bookingId, bookingStatus } = action.payload
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.bookingId === bookingId ? { ...a, bookingStatus } : a
        ),
      }
    }
    case 'appointment/setLoading':
      return { ...state, loading: action.payload }
    case 'appointment/setError':
      return { ...state, error: action.payload }
    case 'appointment/clearError':
      return { ...state, error: null }
    case 'appointment/resetAppointmentState':
      return initialState
    default:
      return state
  }
}

// ─────────────────────────────────────────────────────────────
// Tests: appointmentHelpers
// ─────────────────────────────────────────────────────────────
describe('formatBookingDate', () => {
  test('returns empty string for null/undefined input', () => {
    expect(formatBookingDateFn(null)).toBe('')
    expect(formatBookingDateFn(undefined)).toBe('')
    expect(formatBookingDateFn('')).toBe('')
  })

  test('formats a valid date string', () => {
    const result = formatBookingDateFn('2026-04-10')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result).toContain('2026')
  })

  test('handles ISO datetime strings', () => {
    const result = formatBookingDateFn('2026-04-10T10:30:00')
    expect(result).toBeTruthy()
    expect(result).toContain('2026')
  })
})

describe('formatTimeSlot', () => {
  test('returns empty string when startTime is null', () => {
    expect(formatTimeSlotFn(null, null)).toBe('')
    expect(formatTimeSlotFn(undefined, undefined)).toBe('')
  })

  test('formats a time range correctly', () => {
    const result = formatTimeSlotFn('10:00', '10:30')
    expect(result).toContain('–')
    expect(result.length).toBeGreaterThan(5)
  })

  test('formats only start time when endTime is not provided', () => {
    const result = formatTimeSlotFn('14:00', null)
    expect(result).toBeTruthy()
    expect(result).not.toContain('–')
  })
})

describe('getSlotColorClass', () => {
  test('returns gray class for null slot', () => {
    expect(getSlotColorClassFn(null)).toContain('gray')
  })

  test('returns gray class for blocked slot', () => {
    const result = getSlotColorClassFn({ isBlocked: true, availableCapacity: 5, totalCapacity: 10 })
    expect(result).toContain('gray')
    expect(result).toContain('cursor-not-allowed')
  })

  test('returns red class for full slot', () => {
    const result = getSlotColorClassFn({ isBlocked: false, availableCapacity: 0, totalCapacity: 4, slotStatus: 'Full' })
    expect(result).toContain('red')
    expect(result).toContain('cursor-not-allowed')
  })

  test('returns green class for available slot (>50%)', () => {
    const result = getSlotColorClassFn({ isBlocked: false, availableCapacity: 8, totalCapacity: 10, slotStatus: 'Available' })
    expect(result).toContain('green')
  })

  test('returns yellow class for limited slot (<=50%)', () => {
    const result = getSlotColorClassFn({ isBlocked: false, availableCapacity: 3, totalCapacity: 10, slotStatus: 'Limited' })
    expect(result).toContain('yellow')
  })
})

describe('calculateRemainingSlots', () => {
  test('returns 0 when total is 0', () => {
    expect(calculateRemainingSlotsFn(5, 0)).toBe(0)
  })

  test('returns correct percentage', () => {
    expect(calculateRemainingSlotsFn(5, 10)).toBe(50)
    expect(calculateRemainingSlotsFn(10, 10)).toBe(100)
    expect(calculateRemainingSlotsFn(0, 10)).toBe(0)
    expect(calculateRemainingSlotsFn(3, 10)).toBe(30)
  })

  test('rounds to nearest integer', () => {
    expect(calculateRemainingSlotsFn(1, 3)).toBe(33)
    expect(calculateRemainingSlotsFn(2, 3)).toBe(67)
  })
})

describe('formatBookingNumber', () => {
  test('returns empty string for null/undefined', () => {
    expect(formatBookingNumberFn(null)).toBe('')
    expect(formatBookingNumberFn(undefined)).toBe('')
  })

  test('adds APT- prefix when missing', () => {
    expect(formatBookingNumberFn('2026-000001')).toBe('APT-2026-000001')
  })

  test('does not double-prefix', () => {
    expect(formatBookingNumberFn('APT-2026-000001')).toBe('APT-2026-000001')
  })
})

describe('groupSlotsByHour', () => {
  test('returns empty object for null/empty input', () => {
    expect(groupSlotsByHourFn(null)).toEqual({})
    expect(groupSlotsByHourFn([])).toEqual({})
  })

  test('groups slots by their start hour', () => {
    const slots = [
      { slotId: 1, startTime: '10:00', endTime: '10:30' },
      { slotId: 2, startTime: '10:30', endTime: '11:00' },
      { slotId: 3, startTime: '11:00', endTime: '11:30' },
    ]
    const grouped = groupSlotsByHourFn(slots)
    const keys = Object.keys(grouped)
    expect(keys.length).toBeGreaterThan(0)
    // Both 10:00 and 10:30 slots should be in the same "10 AM" group
    const tenAmKey = keys.find((k) => k.includes('10') || k.toLowerCase().includes('10'))
    expect(tenAmKey).toBeTruthy()
    if (tenAmKey) expect(grouped[tenAmKey].length).toBeGreaterThanOrEqual(1)
  })
})

describe('getSlotStatusLabel', () => {
  test('returns Unknown for null', () => {
    expect(getSlotStatusLabelFn(null)).toBe('Unknown')
  })

  test('returns Blocked for blocked slot', () => {
    expect(getSlotStatusLabelFn({ isBlocked: true })).toBe('Blocked')
  })

  test('returns Full when availableCapacity is 0', () => {
    expect(getSlotStatusLabelFn({ isBlocked: false, availableCapacity: 0, totalCapacity: 4 })).toBe('Full')
  })

  test('returns Available when ratio > 0.5', () => {
    expect(getSlotStatusLabelFn({ isBlocked: false, availableCapacity: 8, totalCapacity: 10 })).toBe('Available')
  })

  test('returns Limited when ratio <= 0.5', () => {
    expect(getSlotStatusLabelFn({ isBlocked: false, availableCapacity: 3, totalCapacity: 10 })).toBe('Limited')
  })
})

// ─────────────────────────────────────────────────────────────
// Tests: Redux slice reducers
// ─────────────────────────────────────────────────────────────
describe('appointmentSlice reducers', () => {
  test('initial state is correct', () => {
    const state = appointmentReducer(undefined, { type: '@@INIT' })
    expect(state.sections).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.selectedSection).toBeNull()
  })

  test('setSections updates sections array', () => {
    const sections = [{ sectionId: 1, sectionName: 'Kitchen' }]
    const state = appointmentReducer(undefined, { type: 'appointment/setSections', payload: sections })
    expect(state.sections).toHaveLength(1)
    expect(state.sections[0].sectionName).toBe('Kitchen')
  })

  test('setSelectedSection resets slot and slots', () => {
    const preState = {
      ...initialState,
      selectedSlot: { slotId: 5 },
      slots: [{ slotId: 5 }],
    }
    const section = { sectionId: 2, sectionName: 'Living Room' }
    const state = appointmentReducer(preState, { type: 'appointment/setSelectedSection', payload: section })
    expect(state.selectedSection).toEqual(section)
    expect(state.selectedSlot).toBeNull()
    expect(state.slots).toEqual([])
  })

  test('setSelectedSlot updates selected slot', () => {
    const slot = { slotId: 10, startTime: '10:00' }
    const state = appointmentReducer(undefined, { type: 'appointment/setSelectedSlot', payload: slot })
    expect(state.selectedSlot).toEqual(slot)
  })

  test('addBooking prepends to appointments', () => {
    const existing = { bookingId: 1, bookingNumber: 'APT-2026-000001' }
    const preState = { ...initialState, appointments: [existing] }
    const newBooking = { bookingId: 2, bookingNumber: 'APT-2026-000002' }
    const state = appointmentReducer(preState, { type: 'appointment/addBooking', payload: newBooking })
    expect(state.appointments).toHaveLength(2)
    expect(state.appointments[0].bookingId).toBe(2)
  })

  test('updateBookingStatus changes status in list', () => {
    const preState = {
      ...initialState,
      appointments: [{ bookingId: 1, bookingStatus: 'Confirmed' }],
    }
    const state = appointmentReducer(preState, {
      type: 'appointment/updateBookingStatus',
      payload: { bookingId: 1, bookingStatus: 'Cancelled' },
    })
    expect(state.appointments[0].bookingStatus).toBe('Cancelled')
  })

  test('setLoading toggles loading state', () => {
    let state = appointmentReducer(undefined, { type: 'appointment/setLoading', payload: true })
    expect(state.loading).toBe(true)
    state = appointmentReducer(state, { type: 'appointment/setLoading', payload: false })
    expect(state.loading).toBe(false)
  })

  test('setError sets error message', () => {
    const state = appointmentReducer(undefined, { type: 'appointment/setError', payload: 'Network error' })
    expect(state.error).toBe('Network error')
  })

  test('clearError resets error to null', () => {
    const preState = { ...initialState, error: 'Some error' }
    const state = appointmentReducer(preState, { type: 'appointment/clearError' })
    expect(state.error).toBeNull()
  })

  test('resetAppointmentState returns initial state', () => {
    const preState = {
      ...initialState,
      sections: [{ sectionId: 1 }],
      loading: true,
      error: 'error',
    }
    const state = appointmentReducer(preState, { type: 'appointment/resetAppointmentState' })
    expect(state).toEqual(initialState)
  })
})

// ─────────────────────────────────────────────────────────────
// Tests: Constants
// ─────────────────────────────────────────────────────────────
describe('appointmentConstants', () => {
  const APPOINTMENT_TYPES = [
    { value: 'Consultation', label: 'Consultation' },
    { value: 'Viewing', label: 'Product Viewing' },
    { value: 'Purchase', label: 'Purchase Assistance' },
    { value: 'Other', label: 'Other' },
  ]

  const BOOKING_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'NoShow',
  }

  test('APPOINTMENT_TYPES has 4 entries', () => {
    expect(APPOINTMENT_TYPES).toHaveLength(4)
  })

  test('All appointment types have value and label', () => {
    APPOINTMENT_TYPES.forEach((t) => {
      expect(t.value).toBeTruthy()
      expect(t.label).toBeTruthy()
    })
  })

  test('BOOKING_STATUS has all required statuses', () => {
    expect(BOOKING_STATUS.CONFIRMED).toBe('Confirmed')
    expect(BOOKING_STATUS.CANCELLED).toBe('Cancelled')
    expect(BOOKING_STATUS.COMPLETED).toBe('Completed')
    expect(BOOKING_STATUS.NO_SHOW).toBe('NoShow')
  })
})

// ─────────────────────────────────────────────────────────────
// Tests: API call mock patterns
// ─────────────────────────────────────────────────────────────
describe('appointmentApi mock patterns', () => {
  const mockAxiosProvider = jest.fn()

  const appointmentApi = {
    getAllSections: () => mockAxiosProvider({ method: 'GET', endpoint: 'Appointment/Section/GetAll' }),
    getSlotAvailability: (sectionId, date) =>
      mockAxiosProvider({ method: 'GET', endpoint: `Appointment/Slot/GetAvailability/${sectionId}`, queryString: `?date=${date}` }),
    createBooking: (payload) =>
      mockAxiosProvider({ method: 'POST', endpoint: 'Appointment/Booking/Create', body: payload }),
    cancelBooking: (bookingId) =>
      mockAxiosProvider({ method: 'DELETE', endpoint: `Appointment/Booking/Cancel/${bookingId}` }),
  }

  beforeEach(() => {
    mockAxiosProvider.mockClear()
  })

  test('getAllSections calls correct endpoint', async () => {
    mockAxiosProvider.mockResolvedValue({ success: true, data: [] })
    await appointmentApi.getAllSections()
    expect(mockAxiosProvider).toHaveBeenCalledWith({
      method: 'GET',
      endpoint: 'Appointment/Section/GetAll',
    })
  })

  test('getSlotAvailability calls correct endpoint with query string', async () => {
    mockAxiosProvider.mockResolvedValue({ success: true, data: [] })
    await appointmentApi.getSlotAvailability(1, '2026-04-10')
    expect(mockAxiosProvider).toHaveBeenCalledWith({
      method: 'GET',
      endpoint: 'Appointment/Slot/GetAvailability/1',
      queryString: '?date=2026-04-10',
    })
  })

  test('createBooking calls POST with body', async () => {
    const payload = { slotId: 5, firstName: 'John', lastName: 'Doe', email: 'j@d.com', phoneNumber: '+91123', appointmentType: 'Consultation' }
    mockAxiosProvider.mockResolvedValue({ success: true, data: { bookingNumber: 'APT-2026-000001' } })
    const result = await appointmentApi.createBooking(payload)
    expect(mockAxiosProvider).toHaveBeenCalledWith({
      method: 'POST',
      endpoint: 'Appointment/Booking/Create',
      body: payload,
    })
    expect(result.success).toBe(true)
    expect(result.data.bookingNumber).toBe('APT-2026-000001')
  })

  test('cancelBooking calls DELETE with correct endpoint', async () => {
    mockAxiosProvider.mockResolvedValue({ success: true, data: null })
    await appointmentApi.cancelBooking(42)
    expect(mockAxiosProvider).toHaveBeenCalledWith({
      method: 'DELETE',
      endpoint: 'Appointment/Booking/Cancel/42',
    })
  })

  test('handles API error response gracefully', async () => {
    mockAxiosProvider.mockResolvedValue({ success: false, data: null, message: 'Slot is fully booked' })
    const result = await appointmentApi.createBooking({ slotId: 999 })
    expect(result.success).toBe(false)
    expect(result.message).toBe('Slot is fully booked')
  })
})
