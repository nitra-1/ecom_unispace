/**
 * AxiosProvider — centralised HTTP client for the appointment booking feature.
 *
 * Responsibilities:
 *  1. Attach JWT Bearer token from nookies on every request.
 *  2. Attach X-Device-Id header on every request (required by backend middleware).
 *  3. Automatically refresh the access token on 401 responses using the refresh
 *     token flow (calls Account/Customer/ValidateToken).
 *  4. Return standardised { success, data, message } response shape so callers
 *     don't need to unwrap axios response objects.
 *
 * Usage (matches existing appointmentApi.js calls):
 *   axiosProvider({ method: 'GET', endpoint: 'Appointment/Section/GetAll' })
 *   axiosProvider({ method: 'POST', endpoint: 'Appointment/Booking/Create', body: payload })
 */

import axios from 'axios'
import { setCookie, destroyCookie } from 'nookies'
import { getBaseUrl, getDeviceId, getRefreshToken, getUserToken, getUserId } from './GetBaseUrl'

// ── Axios instance ────────────────────────────────────────────────────────────
// A named instance keeps appointment-booking requests isolated from other Axios
// usages in the app, making it easier to debug interceptors independently.
const client = axios.create()

// ── Refresh-token state ───────────────────────────────────────────────────────
// Shared across interceptor invocations to deduplicate concurrent refresh calls.
let isRefreshing = false
let pendingRequests = []

/** Replay all queued requests after a successful token refresh. */
const flushPendingRequests = (newToken) => {
  pendingRequests.forEach(({ resolve }) => resolve(newToken))
  pendingRequests = []
}

/** Reject all queued requests (e.g. after a failed refresh / logout). */
const rejectPendingRequests = (error) => {
  pendingRequests.forEach(({ reject }) => reject(error))
  pendingRequests = []
}

// ── Request interceptor ───────────────────────────────────────────────────────
// Adds Authorization and X-Device-Id headers before every request.
client.interceptors.request.use((config) => {
  const token = getUserToken()
  const deviceId = getDeviceId()

  // JWT Bearer token — backend validates this on protected routes
  if (token) config.headers['Authorization'] = `Bearer ${token}`

  // Device ID — required by DeviceIdMiddleware on the backend for audit logging
  if (deviceId) config.headers['X-Device-Id'] = deviceId

  return config
})

// ── Response interceptor ─────────────────────────────────────────────────────
// Handles 401 Unauthorized by attempting a token refresh before retrying.
client.interceptors.response.use(
  // Success path — return the response unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        try {
          // Call the validate/refresh endpoint from the existing auth service
          const accessToken = getUserToken()
          const refreshToken = getRefreshToken()
          const deviceId = getDeviceId()
          const userId = getUserId()

          const params = new URLSearchParams({
            AccessToken: accessToken ?? '',
            RefreshToken: refreshToken ?? '',
            DeviceId: deviceId ?? '',
            UserId: userId ?? '',
          })

          const refreshResponse = await axios.get(
            `${getBaseUrl()}Account/Customer/ValidateToken?${params}`
          )
          const result = refreshResponse?.data?.data

          if (result?.action?.toLowerCase() === 'logout') {
            // Server told us to log out — clear cookies and reject all queued requests
            destroyCookie(null, 'userToken')
            destroyCookie(null, 'refreshToken')
            rejectPendingRequests(new Error('Session expired. Please log in again.'))
            return Promise.reject(error)
          }

          if (result?.accessToken) {
            // Persist refreshed tokens in cookies (same names used across the app)
            setCookie(null, 'userToken', result.accessToken, { path: '/' })
            if (result.refreshToken) {
              setCookie(null, 'refreshToken', result.refreshToken, { path: '/' })
            }

            // Replay original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${result.accessToken}`
            flushPendingRequests(result.accessToken)
            return client(originalRequest)
          }
        } catch (refreshError) {
          rejectPendingRequests(refreshError)
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Another refresh is already in progress — queue this request until done
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            resolve(client(originalRequest))
          },
          reject,
        })
      })
    }

    return Promise.reject(error)
  }
)

// ── Main provider function ────────────────────────────────────────────────────
/**
 * Sends an HTTP request and returns a standardised { success, data, message }
 * response object so all callers in appointmentApi.js have a consistent shape.
 *
 * @param {{ method: string, endpoint: string, body?: object, queryString?: string }} config
 */
async function axiosProvider({ method, endpoint, body, queryString = '' }) {
  const url = `${getBaseUrl()}${endpoint}${queryString}`

  try {
    const response = await client({
      method,
      url,
      data: body ?? undefined,
    })
    // Some endpoints return { success, data, message } directly; others return data
    return response.data
  } catch (err) {
    // Return the backend error payload if available so callers can display messages
    if (err?.response?.data) return err.response.data
    return { success: false, data: null, message: err?.message ?? 'Request failed' }
  }
}

export default axiosProvider
