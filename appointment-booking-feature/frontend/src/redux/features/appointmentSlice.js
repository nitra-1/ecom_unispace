import { createSlice } from '@reduxjs/toolkit'

/** @type {import('@reduxjs/toolkit').SliceState} */
const initialState = {
  /** All active showroom sections */
  sections: [],
  /** Currently selected section for booking */
  selectedSection: null,
  /** Currently selected time slot */
  selectedSlot: null,
  /** Slots for the currently selected section+date */
  slots: [],
  /** All customer appointments */
  appointments: [],
  /** Upcoming (future) appointments */
  upcomingAppointments: [],
  /** Loading state */
  loading: false,
  /** Error message */
  error: null,
}

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    /** Set the full list of sections */
    setSections(state, action) {
      state.sections = action.payload
    },

    /** Set the selected section */
    setSelectedSection(state, action) {
      state.selectedSection = action.payload
      state.selectedSlot = null // reset slot on section change
      state.slots = []
    },

    /** Set the selected time slot */
    setSelectedSlot(state, action) {
      state.selectedSlot = action.payload
    },

    /** Set available slots for current section+date */
    setSlots(state, action) {
      state.slots = action.payload
    },

    /** Set all customer appointments */
    setAppointments(state, action) {
      state.appointments = action.payload
    },

    /** Set upcoming appointments */
    setUpcomingAppointments(state, action) {
      state.upcomingAppointments = action.payload
    },

    /** Add a newly created booking to the appointments list */
    addBooking(state, action) {
      state.appointments.unshift(action.payload)
    },

    /** Update booking status in the list */
    updateBookingStatus(state, action) {
      const { bookingId, bookingStatus } = action.payload
      const idx = state.appointments.findIndex((a) => a.bookingId === bookingId)
      if (idx !== -1) {
        state.appointments[idx] = { ...state.appointments[idx], bookingStatus }
      }
      // Also update upcoming
      const upcomingIdx = state.upcomingAppointments.findIndex(
        (a) => a.bookingId === bookingId
      )
      if (upcomingIdx !== -1) {
        if (bookingStatus === 'Cancelled') {
          state.upcomingAppointments.splice(upcomingIdx, 1)
        } else {
          state.upcomingAppointments[upcomingIdx] = {
            ...state.upcomingAppointments[upcomingIdx],
            bookingStatus,
          }
        }
      }
    },

    /** Set loading state */
    setLoading(state, action) {
      state.loading = action.payload
    },

    /** Set error message */
    setError(state, action) {
      state.error = action.payload
    },

    /** Clear error */
    clearError(state) {
      state.error = null
    },

    /** Reset to initial state */
    resetAppointmentState() {
      return initialState
    },
  },
})

export const {
  setSections,
  setSelectedSection,
  setSelectedSlot,
  setSlots,
  setAppointments,
  setUpcomingAppointments,
  addBooking,
  updateBookingStatus,
  setLoading,
  setError,
  clearError,
  resetAppointmentState,
} = appointmentSlice.actions

export default appointmentSlice.reducer
