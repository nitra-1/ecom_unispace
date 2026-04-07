import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sections: [],
  selectedSection: null,
  capacity: [],
  slots: [],
  appointments: [],
  loading: false,
  error: null,
}

const appointmentAdminSlice = createSlice({
  name: 'appointmentAdmin',
  initialState,
  reducers: {
    setSections(state, action) {
      state.sections = action.payload
    },
    setSelectedSection(state, action) {
      state.selectedSection = action.payload
    },
    setCapacity(state, action) {
      state.capacity = action.payload
    },
    setSlots(state, action) {
      state.slots = action.payload
    },
    updateSlotInList(state, action) {
      const { slotId, changes } = action.payload
      const idx = state.slots.findIndex((s) => s.slotId === slotId)
      if (idx !== -1) {
        state.slots[idx] = { ...state.slots[idx], ...changes }
      }
    },
    setAppointments(state, action) {
      state.appointments = action.payload
    },
    updateAppointmentStatus(state, action) {
      const { bookingId, bookingStatus } = action.payload
      const idx = state.appointments.findIndex((a) => a.bookingId === bookingId)
      if (idx !== -1) {
        state.appointments[idx] = { ...state.appointments[idx], bookingStatus }
      }
    },
    removeSection(state, action) {
      state.sections = state.sections.filter((s) => s.sectionId !== action.payload)
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
    setError(state, action) {
      state.error = action.payload
    },
    clearError(state) {
      state.error = null
    },
    resetAdminState() {
      return initialState
    },
  },
})

export const {
  setSections,
  setSelectedSection,
  setCapacity,
  setSlots,
  updateSlotInList,
  setAppointments,
  updateAppointmentStatus,
  removeSection,
  setLoading,
  setError,
  clearError,
  resetAdminState,
} = appointmentAdminSlice.actions

export default appointmentAdminSlice.reducer
