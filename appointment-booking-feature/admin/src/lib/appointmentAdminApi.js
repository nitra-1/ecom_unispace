/**
 * appointmentAdminApi.js — Admin Panel API client for the Appointment Booking feature.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION WITH EF6 DATABASE-FIRST BACKEND                               │
 * │                                                                            │
 * │ This file consumes the rebuilt .NET 8 Appointment APIs backed by           │
 * │ EF Core Database-First scaffolded models (no Code-First migrations).       │
 * │                                                                            │
 * │ Backend route prefix:  api/Appointment/                                    │
 * │ Response shape:        { success: bool, data: object|null, message: string }│
 * │                                                                            │
 * │ Authentication: JWT Bearer token from localStorage (admin uses localStorage│
 * │                 unlike the customer frontend which uses nookies cookies).   │
 * │ Device ID:     X-Device-Id header from localStorage, attached on every     │
 * │                request (required by backend DeviceIdMiddleware).            │
 * │ Real-time:     SignalR hub at /hubs/appointment for live dashboard updates.│
 * │                                                                            │
 * │ HOW TO ADD A NEW ADMIN ENDPOINT:                                          │
 * │   1. Add the route in the .NET controller with [Authorize(Roles="Admin")] │
 * │   2. Add a method below following the same pattern                        │
 * │   3. Update the corresponding Formik form / Ant Design table component    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import axios from 'axios'

// Base URL for all API calls — must match the backend's hosting address
const API_BASE = 'https://api.aparna.hashtechy.space/api/'

// ── Helpers ───────────────────────────────────────────────────────────────────
// Admin panel stores auth data in localStorage (unlike frontend which uses cookies)

/** Returns stored JWT token from localStorage. */
const getToken = () => localStorage.getItem('token')

/** Returns stored refresh token from localStorage. */
const getRefreshToken = () => localStorage.getItem('refreshToken')

/** Returns stored device ID from localStorage (sent as X-Device-Id header). */
const getDeviceId = () => localStorage.getItem('deviceId')

/** Returns stored user ID from localStorage. */
const getUserId = () => localStorage.getItem('userId')

/** Builds Authorization + device ID headers for every request. */
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
  'X-Device-Id': getDeviceId() ?? '',
})

// ── Axios instance ─────────────────────────────────────────────────────────────
// Separate instance from the customer frontend to avoid interceptor conflicts
const adminClient = axios.create({ baseURL: API_BASE })

// Attach auth headers on every outgoing request
adminClient.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${getToken()}`
  config.headers['X-Device-Id'] = getDeviceId() ?? ''
  return config
})

// ── Refresh-token state ────────────────────────────────────────────────────────
// Shared across interceptor invocations to deduplicate concurrent 401 refreshes
let isRefreshing = false
let pendingRequests = []

const flushPendingRequests = (newToken) => {
  pendingRequests.forEach(({ resolve }) => resolve(newToken))
  pendingRequests = []
}

const rejectPendingRequests = (error) => {
  pendingRequests.forEach(({ reject }) => reject(error))
  pendingRequests = []
}

// ── Response interceptor ───────────────────────────────────────────────────────
// Handles 401 Unauthorized by attempting a token refresh before retrying.
// This ensures admin sessions stay alive without manual re-login.
adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        try {
          // Call the central auth service to validate / refresh the token
          const params = new URLSearchParams({
            AccessToken: getToken() ?? '',
            RefreshToken: getRefreshToken() ?? '',
            DeviceId: getDeviceId() ?? '',
            UserId: getUserId() ?? '',
          })

          const refreshResponse = await axios.get(
            `${API_BASE}Account/Customer/ValidateToken?${params}`
          )
          const result = refreshResponse?.data?.data

          if (result?.action?.toLowerCase() === 'logout') {
            // Server instructed logout — clear storage and redirect to login
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            rejectPendingRequests(new Error('Session expired'))
            window.location.href = '/login'
            return Promise.reject(error)
          }

          if (result?.accessToken) {
            // Persist new tokens in localStorage
            localStorage.setItem('token', result.accessToken)
            if (result.refreshToken) {
              localStorage.setItem('refreshToken', result.refreshToken)
            }

            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${result.accessToken}`
            flushPendingRequests(result.accessToken)
            return adminClient(originalRequest)
          }
        } catch (refreshError) {
          rejectPendingRequests(refreshError)
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Another refresh is already in progress — queue this request
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            resolve(adminClient(originalRequest))
          },
          reject,
        })
      })
    }

    return Promise.reject(error)
  }
)

// ── Wrapper ───────────────────────────────────────────────────────────────────
/** Sends a request and returns the standardised { success, data, message } payload. */
const request = async (method, path, data = null, params = null) => {
  try {
    const response = await adminClient({ method, url: path, data, params })
    return response.data
  } catch (err) {
    if (err?.response?.data) return err.response.data
    return { success: false, data: null, message: err?.message ?? 'Request failed' }
  }
}

// ── API Methods ───────────────────────────────────────────────────────────────
// Each method maps to a specific backend controller action.
// The endpoint paths match the [Route] attributes on the .NET controllers.
export const appointmentAdminApi = {
  // ── Sections ────────────────────────────────────────────────────────────────
  // Backend: AppointmentSectionController (EF6 DB-First → dbo.AppointmentSection)
  // Admin form: SectionForm.jsx (Formik → SectionRequest DTO)
  getAllSections: () => request('GET', 'Appointment/Section/GetAll'),
  getSectionById: (id) => request('GET', `Appointment/Section/${id}`),
  createSection: (payload) => request('POST', 'Appointment/Section', payload),
  updateSection: (id, payload) => request('PUT', `Appointment/Section/${id}`, payload),
  deleteSection: (id) => request('DELETE', `Appointment/Section/${id}`),

  // ── Capacity ─────────────────────────────────────────────────────────────────
  // Backend: AppointmentCapacityController (EF6 DB-First → dbo.AppointmentCapacity)
  // Admin form: CapacityForm.jsx (Formik → CapacityRequest DTO)
  getCapacityBySection: (sectionId) =>
    request('GET', `Appointment/Capacity/GetBySection/${sectionId}`),
  createCapacity: (payload) => request('POST', 'Appointment/Capacity', payload),
  updateCapacity: (id, payload) => request('PUT', `Appointment/Capacity/${id}`, payload),
  deleteCapacity: (id) => request('DELETE', `Appointment/Capacity/${id}`),

  // ── Slots ────────────────────────────────────────────────────────────────────
  // Backend: AppointmentSlotController (EF6 DB-First → dbo.AppointmentSlot)
  getSlotAvailability: (sectionId, date) =>
    request('GET', `Appointment/Slot/GetAvailability/${sectionId}`, null, { date }),
  generateSlots: (payload) => request('POST', 'Appointment/Slot/Generate', payload),
  blockSlot: (payload) => request('POST', 'Appointment/Slot/Block', payload),
  unblockSlot: (payload) => request('POST', 'Appointment/Slot/Unblock', payload),
  forceBookSlot: (payload) => request('POST', 'Appointment/Slot/ForceBook', payload),

  // ── Bookings ──────────────────────────────────────────────────────────────────
  // Backend: AppointmentBookingController (EF6 DB-First → dbo.AppointmentBooking)
  searchAppointments: (queryString) =>
    request('GET', `Appointment/Booking/Search?${queryString}`),
  getBookingById: (id) => request('GET', `Appointment/Booking/${id}`),
  cancelBooking: (id) => request('DELETE', `Appointment/Booking/Cancel/${id}`),
  rescheduleBooking: (id, payload) =>
    request('PUT', `Appointment/Booking/Reschedule/${id}`, payload),

  // ── Reminders ─────────────────────────────────────────────────────────────────
  // Backend: AppointmentReminderController (EF6 DB-First → dbo.AppointmentReminderPreference)
  getUpcomingReminders: () => request('GET', 'Appointment/Reminder/GetUpcoming'),
  sendReminder: (payload) => request('POST', 'Appointment/Reminder/Send', payload),
  getReminderPreferences: (customerId) =>
    request('GET', `Appointment/Reminder/Preferences/${customerId}`),
  updateReminderPreferences: (customerId, payload) =>
    request('PUT', `Appointment/Reminder/Preferences/${customerId}`, payload),
}

export default appointmentAdminApi

