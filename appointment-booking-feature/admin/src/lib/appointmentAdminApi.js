/**
 * appointmentAdminApi — Axios-based API client for the admin panel.
 *
 * Features:
 *  1. JWT Bearer token from localStorage (admin panel uses localStorage, not cookies).
 *  2. X-Device-Id header on every request (required by backend DeviceIdMiddleware).
 *  3. Response interceptor for automatic JWT refresh on 401 Unauthorized.
 *  4. All functions return the backend's { success, data, message } shape.
 */

import axios from 'axios'

const API_BASE = 'https://api.aparna.hashtechy.space/api/'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns stored JWT token from localStorage. */
const getToken = () => localStorage.getItem('token')

/** Returns stored refresh token from localStorage. */
const getRefreshToken = () => localStorage.getItem('refreshToken')

/** Returns stored device ID from localStorage. */
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
const adminClient = axios.create({ baseURL: API_BASE })

// Attach auth headers on every request
adminClient.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${getToken()}`
  config.headers['X-Device-Id'] = getDeviceId() ?? ''
  return config
})

// ── Refresh-token state ────────────────────────────────────────────────────────
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
// Attempts a token refresh on 401 before retrying the original request.
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
            // Server instructed logout — clear storage and reject queued requests
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            rejectPendingRequests(new Error('Session expired'))
            window.location.href = '/login'
            return Promise.reject(error)
          }

          if (result?.accessToken) {
            // Persist new tokens
            localStorage.setItem('token', result.accessToken)
            if (result.refreshToken) {
              localStorage.setItem('refreshToken', result.refreshToken)
            }

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

      // Queue this request while a refresh is already in progress
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
/** Sends a request and returns a standardised { success, data, message } payload. */
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

