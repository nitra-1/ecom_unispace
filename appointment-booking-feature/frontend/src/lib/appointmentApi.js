import axiosProvider from '@/lib/AxiosProvider'

/**
 * Centralised API helper for all appointment-related endpoints.
 * Uses the project's axiosProvider for request/response handling.
 */
export const appointmentApi = {
  // ── Sections ────────────────────────────────────────────────────────────────

  /** Fetch all active sections. */
  getAllSections: () =>
    axiosProvider({ method: 'GET', endpoint: 'Appointment/Section/GetAll' }),

  /** Fetch a single section by ID. */
  getSectionById: (id) =>
    axiosProvider({ method: 'GET', endpoint: `Appointment/Section/${id}` }),

  // ── Slots ────────────────────────────────────────────────────────────────────

  /**
   * Get slot availability for a section on a specific date.
   * @param {number|string} sectionId
   * @param {string} date - YYYY-MM-DD
   */
  getSlotAvailability: (sectionId, date) =>
    axiosProvider({
      method: 'GET',
      endpoint: `Appointment/Slot/GetAvailability/${sectionId}`,
      queryString: `?date=${date}`,
    }),

  /**
   * Get real-time slot availability (bypasses cache).
   * @param {number|string} sectionId
   * @param {string} date - YYYY-MM-DD
   */
  getRealTimeSlots: (sectionId, date) =>
    axiosProvider({
      method: 'GET',
      endpoint: `Appointment/Slot/GetRealTime/${sectionId}`,
      queryString: `?date=${date}`,
    }),

  // ── Bookings ─────────────────────────────────────────────────────────────────

  /**
   * Create a new appointment booking (public).
   * @param {{ slotId, firstName, lastName, email, phoneNumber, appointmentType, notes, customerId? }} payload
   */
  createBooking: (payload) =>
    axiosProvider({
      method: 'POST',
      endpoint: 'Appointment/Booking/Create',
      body: payload,
    }),

  /** Get all bookings for the authenticated customer. */
  getCustomerBookings: () =>
    axiosProvider({
      method: 'GET',
      endpoint: 'Appointment/Booking/GetCustomerBookings',
    }),

  /**
   * Get a single booking by ID.
   * @param {number|string} bookingId
   */
  getBookingById: (bookingId) =>
    axiosProvider({
      method: 'GET',
      endpoint: `Appointment/Booking/${bookingId}`,
    }),

  /**
   * Reschedule an existing booking to a new slot.
   * @param {number|string} bookingId
   * @param {{ newSlotId: number }} payload
   */
  rescheduleBooking: (bookingId, payload) =>
    axiosProvider({
      method: 'PUT',
      endpoint: `Appointment/Booking/Reschedule/${bookingId}`,
      body: payload,
    }),

  /**
   * Cancel a booking.
   * @param {number|string} bookingId
   */
  cancelBooking: (bookingId) =>
    axiosProvider({
      method: 'DELETE',
      endpoint: `Appointment/Booking/Cancel/${bookingId}`,
    }),

  // ── Reminders ────────────────────────────────────────────────────────────────

  /**
   * Get reminder preferences for a customer.
   * @param {string} customerId
   */
  getReminderPreferences: (customerId) =>
    axiosProvider({
      method: 'GET',
      endpoint: `Appointment/Reminder/Preferences/${customerId}`,
    }),

  /**
   * Update reminder preferences for a customer.
   * @param {string} customerId
   * @param {{ reminderDaysBefore, reminderHourBefore, enableEmailReminder, enableSmsReminder }} payload
   */
  updateReminderPreferences: (customerId, payload) =>
    axiosProvider({
      method: 'PUT',
      endpoint: `Appointment/Reminder/Preferences/${customerId}`,
      body: payload,
    }),
}

export default appointmentApi
