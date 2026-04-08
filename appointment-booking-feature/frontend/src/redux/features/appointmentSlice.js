/**
 * appointmentSlice.js — Redux Toolkit slice for appointment state management.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION WITH EF6 DATABASE-FIRST BACKEND                               │
 * │                                                                            │
 * │ This slice manages client-side state for the Appointment Booking feature.  │
 * │ Data flows from the EF Core DB-First backend → appointmentApi.js → here.  │
 * │                                                                            │
 * │ State is persisted via redux-persist so appointments survive page reloads. │
 * │                                                                            │
 * │ SignalR integration:                                                       │
 * │   The frontend connects to /hubs/appointment and listens for:              │
 * │     - BookingCreated   → dispatch(addBooking(booking))                     │
 * │     - BookingCancelled → dispatch(updateBookingStatus({bookingId, ...}))   │
 * │     - SlotBlocked      → dispatch(updateSlotInList({slotId, changes}))     │
 * │     - SlotUnblocked    → dispatch(updateSlotInList({slotId, changes}))     │
 * │                                                                            │
 * │ Data shape matches the backend DTO:                                        │
 * │   { bookingId, bookingNumber, slotId, sectionId, firstName, ... }          │
 * │   (camelCase — set by ASP.NET Core JsonOptions.PropertyNamingPolicy)       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { createSlice } from '@reduxjs/toolkit'

/** @type {import('@reduxjs/toolkit').SliceState} */
const initialState = {
  /** All active showroom sections (from dbo.AppointmentSection via EF6 DB-First) */
  sections: [],
  /** Currently selected section for booking */
  selectedSection: null,
  /** Currently selected time slot */
  selectedSlot: null,
  /** Slots for the currently selected section+date (from dbo.AppointmentSlot) */
  slots: [],
  /** All customer appointments (from dbo.AppointmentBooking) */
  appointments: [],
  /** Upcoming (future) appointments */
  upcomingAppointments: [],
  /** Loading state — set true during API calls */
  loading: false,
  /** Error message from failed API calls */
  error: null,
}

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    /** Set the full list of sections (from appointmentApi.getAllSections()) */
    setSections(state, action) {
      state.sections = action.payload
    },

    /** Set the selected section — resets slot selection */
    setSelectedSection(state, action) {
      state.selectedSection = action.payload
      state.selectedSlot = null // reset slot on section change
      state.slots = []
    },

    /** Set the selected time slot */
    setSelectedSlot(state, action) {
      state.selectedSlot = action.payload
    },

    /** Set available slots for current section+date (from appointmentApi.getSlotAvailability()) */
    setSlots(state, action) {
      state.slots = action.payload
    },

    /** Set all customer appointments (from appointmentApi.getCustomerBookings()) */
    setAppointments(state, action) {
      state.appointments = action.payload
    },

    /** Set upcoming appointments (filtered from appointments by date) */
    setUpcomingAppointments(state, action) {
      state.upcomingAppointments = action.payload
    },

    /**
     * Add a newly created booking to the appointments list.
     * Called after successful appointmentApi.createBooking() or on
     * SignalR "BookingCreated" event.
     */
    addBooking(state, action) {
      state.appointments.unshift(action.payload)
    },

    /**
     * Update booking status in the list.
     * Called on cancel/reschedule or on SignalR "BookingCancelled"/"BookingRescheduled".
     */
    updateBookingStatus(state, action) {
      const { bookingId, bookingStatus } = action.payload
      const idx = state.appointments.findIndex((a) => a.bookingId === bookingId)
      if (idx !== -1) {
        state.appointments[idx] = { ...state.appointments[idx], bookingStatus }
      }
      // Also update upcoming appointments list
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

    /** Set loading state (true during API calls, false when done) */
    setLoading(state, action) {
      state.loading = action.payload
    },

    /** Set error message (from failed API responses) */
    setError(state, action) {
      state.error = action.payload
    },

    /**
     * Update a single slot in the slots list — used by SignalR push events
     * (SlotBlocked, SlotUnblocked) so the UI reflects live changes without
     * a full page reload.
     *
     * @param {{ slotId: number, changes: Partial<SlotAvailabilityResponse> }} payload
     */
    updateSlotInList(state, action) {
      const { slotId, changes } = action.payload
      const idx = state.slots.findIndex((s) => s.slotId === slotId)
      if (idx !== -1) {
        state.slots[idx] = { ...state.slots[idx], ...changes }
      }
    },

    /** Clear error */
    clearError(state) {
      state.error = null
    },

    /** Reset to initial state (e.g. on logout) */
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
  updateSlotInList,
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
