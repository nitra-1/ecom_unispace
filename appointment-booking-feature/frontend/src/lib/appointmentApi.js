/**
 * appointmentApi.js — Customer Frontend API client for the Appointment Booking feature.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION WITH EF CORE DATABASE-FIRST BACKEND                               │
 * │                                                                            │
 * │ This file consumes the rebuilt .NET 8 Appointment APIs backed by           │
 * │ EF Core Database-First scaffolded models (no Code-First migrations).       │
 * │                                                                            │
 * │ Backend route prefix:  api/Appointment/                                    │
 * │ Response shape:        { success: bool, data: object|null, message: string }│
 * │                                                                            │
 * │ Authentication: JWT Bearer token from nookies cookies.                     │
 * │ Device ID:     X-Device-Id header attached by AxiosProvider interceptor.   │
 * │ Real-time:     SignalR hub at /hubs/appointment for live slot updates.     │
 * │                                                                            │
 * │ HOW TO ADD A NEW ENDPOINT:                                                │
 * │   1. Add the route in the .NET controller (e.g. AppointmentBookingCtrl)   │
 * │   2. Add a method below following the same pattern                        │
 * │   3. Dispatch the result into the Redux slice (appointmentSlice.js)       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import axiosProvider from '@/lib/AxiosProvider'

/**
 * Centralised API helper for all appointment-related endpoints.
 *
 * Uses the project's axiosProvider which:
 *   - Attaches JWT Bearer token from nookies on every request
 *   - Attaches X-Device-Id header (required by backend DeviceIdMiddleware)
 *   - Auto-refreshes expired JWT tokens via the refresh-token flow
 *   - Returns the standardised { success, data, message } response shape
 */
export const appointmentApi = {
  // ── Sections ────────────────────────────────────────────────────────────────
  // Backend: AppointmentSectionController (EF Core DB-First → dbo.AppointmentSection)

  /** Fetch all active sections. Used to populate the section browser on page load. */
  getAllSections: () =>
    axiosProvider({ method: 'GET', endpoint: 'Appointment/Section/GetAll' }),

  /** Fetch a single section by ID. Used for the section detail page. */
  getSectionById: (id) =>
    axiosProvider({ method: 'GET', endpoint: `Appointment/Section/${id}` }),

  // ── Slots ────────────────────────────────────────────────────────────────────
  // Backend: AppointmentSlotController (EF Core DB-First → dbo.AppointmentSlot)

  /**
   * Get slot availability for a section on a specific date.
   * The response includes status, colour code, and available capacity for each slot.
   * @param {number|string} sectionId - Section primary key
   * @param {string} date - Date in YYYY-MM-DD format
   */
  getSlotAvailability: (sectionId, date) =>
    axiosProvider({
      method: 'GET',
      endpoint: `Appointment/Slot/GetAvailability/${sectionId}`,
      queryString: `?date=${date}`,
    }),

  /**
   * Get real-time slot availability (bypasses EF change-tracker cache).
   * Call this after receiving a SignalR push event for guaranteed-fresh data.
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
  // Backend: AppointmentBookingController (EF Core DB-First → dbo.AppointmentBooking)

  /**
   * Create a new appointment booking (public endpoint — no JWT required).
   * The backend uses pessimistic locking (SQL UPDLOCK) to prevent double-booking.
   * @param {{ slotId, firstName, lastName, email, phoneNumber, appointmentType, notes, customerId? }} payload
   */
  createBooking: (payload) =>
    axiosProvider({
      method: 'POST',
      endpoint: 'Appointment/Booking/Create',
      body: payload,
    }),

  /**
   * Get all bookings for the authenticated customer.
   * Requires a valid JWT token (customer must be logged in).
   */
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
   * Requires authentication. The backend atomically releases the old slot
   * and books the new one.
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
   * Cancel a booking. The backend releases the slot capacity so others can book.
   * @param {number|string} bookingId
   */
  cancelBooking: (bookingId) =>
    axiosProvider({
      method: 'DELETE',
      endpoint: `Appointment/Booking/Cancel/${bookingId}`,
    }),

  // ── Reminders ────────────────────────────────────────────────────────────────
  // Backend: AppointmentReminderController (EF Core DB-First → dbo.AppointmentReminderPreference)

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
   * Update reminder preferences for a customer (upsert pattern).
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
