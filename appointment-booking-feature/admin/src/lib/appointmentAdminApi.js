import axios from 'axios'

const API_BASE = 'https://api.aparna.hashtechy.space/api/'

/** Returns JWT auth headers from localStorage. */
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
})

/** Wraps axios calls with standardised error handling. */
const request = async (method, path, data = null, params = null) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${path}`,
      headers: getHeaders(),
      data,
      params,
    })
    return response.data
  } catch (err) {
    if (err.response?.data) return err.response.data
    return { success: false, data: null, message: err.message || 'Request failed' }
  }
}

export const appointmentAdminApi = {
  // ── Sections ────────────────────────────────────────────────────────────────
  getAllSections: () => request('GET', 'Appointment/Section/GetAll'),
  getSectionById: (id) => request('GET', `Appointment/Section/${id}`),
  createSection: (payload) => request('POST', 'Appointment/Section', payload),
  updateSection: (id, payload) => request('PUT', `Appointment/Section/${id}`, payload),
  deleteSection: (id) => request('DELETE', `Appointment/Section/${id}`),

  // ── Capacity ─────────────────────────────────────────────────────────────────
  getCapacityBySection: (sectionId) =>
    request('GET', `Appointment/Capacity/GetBySection/${sectionId}`),
  createCapacity: (payload) => request('POST', 'Appointment/Capacity', payload),
  updateCapacity: (id, payload) => request('PUT', `Appointment/Capacity/${id}`, payload),
  deleteCapacity: (id) => request('DELETE', `Appointment/Capacity/${id}`),

  // ── Slots ────────────────────────────────────────────────────────────────────
  getSlotAvailability: (sectionId, date) =>
    request('GET', `Appointment/Slot/GetAvailability/${sectionId}`, null, { date }),
  generateSlots: (payload) => request('POST', 'Appointment/Slot/Generate', payload),
  blockSlot: (payload) => request('POST', 'Appointment/Slot/Block', payload),
  unblockSlot: (payload) => request('POST', 'Appointment/Slot/Unblock', payload),
  forceBookSlot: (payload) => request('POST', 'Appointment/Slot/ForceBook', payload),

  // ── Bookings ──────────────────────────────────────────────────────────────────
  searchAppointments: (queryString) =>
    request('GET', `Appointment/Booking/Search?${queryString}`),
  getBookingById: (id) => request('GET', `Appointment/Booking/${id}`),
  cancelBooking: (id) => request('DELETE', `Appointment/Booking/Cancel/${id}`),
  rescheduleBooking: (id, payload) =>
    request('PUT', `Appointment/Booking/Reschedule/${id}`, payload),

  // ── Reminders ─────────────────────────────────────────────────────────────────
  getUpcomingReminders: () => request('GET', 'Appointment/Reminder/GetUpcoming'),
  sendReminder: (payload) => request('POST', 'Appointment/Reminder/Send', payload),
  getReminderPreferences: (customerId) =>
    request('GET', `Appointment/Reminder/Preferences/${customerId}`),
  updateReminderPreferences: (customerId, payload) =>
    request('PUT', `Appointment/Reminder/Preferences/${customerId}`, payload),
}

export default appointmentAdminApi
