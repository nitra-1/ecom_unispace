/**
 * appointmentApi.js
 *
 * Centralised API helper for the Appointment Booking module.
 *
 * All functions return the response data directly on success,
 * or throw an error on failure so callers can catch and display messages.
 *
 * Usage:
 *   import api from '@/api/appointmentApi'
 *   const sections = await api.getSections()
 */

import axios from 'axios'

// Base URL is injected via the environment variable.
// In Next.js 14 set NEXT_PUBLIC_APPOINTMENT_API_URL in .env.local
const BASE_URL =
  process.env.NEXT_PUBLIC_APPOINTMENT_API_URL || 'http://localhost:5050/api'

// Create an axios instance so every request includes auth headers automatically
const client = axios.create({ baseURL: BASE_URL })

// Attach the JWT token before every request
client.interceptors.request.use((config) => {
  // Works in both browser (localStorage) and can be swapped for cookie-based auth
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Sections ──────────────────────────────────────────────────────────────────

export async function getSections() {
  const res = await client.get('/sections')
  return res.data.data
}

export async function getSection(id) {
  const res = await client.get(`/sections/${id}`)
  return res.data.data
}

// ── Slots ─────────────────────────────────────────────────────────────────────

/**
 * getSlots
 * Returns enriched slot objects for a given section and date.
 * Each slot includes an `availability` property: "available" | "limited" | "full" | "blocked"
 *
 * @param {number|string} sectionId
 * @param {string}        date         YYYY-MM-DD
 */
export async function getSlots(sectionId, date) {
  const res = await client.get('/slots', { params: { sectionId, date } })
  return res.data.data
}

// ── Appointments ──────────────────────────────────────────────────────────────

/**
 * bookAppointment
 * Creates a new appointment.
 *
 * @param {object} payload
 * @param {number}  payload.slotId
 * @param {number}  payload.sectionId
 * @param {string}  payload.userName
 * @param {string}  payload.userEmail
 * @param {string}  payload.userPhone
 * @param {string}  payload.userId        (optional – logged-in user ID)
 * @param {string}  payload.appointmentDate  YYYY-MM-DD
 * @param {string}  payload.appointmentTime  HH:MM
 */
export async function bookAppointment(payload) {
  const res = await client.post('/appointments', payload)
  return res.data
}

/**
 * getMyAppointments
 * Lists appointments for the currently authenticated user.
 *
 * @param {object} params  – { pageIndex, pageSize }
 */
export async function getMyAppointments(params = {}) {
  const res = await client.get('/appointments', { params })
  return res.data
}

/**
 * getAppointment – fetch a single appointment by ID
 */
export async function getAppointment(id) {
  const res = await client.get(`/appointments/${id}`)
  return res.data.data
}

/**
 * cancelAppointment
 * @param {number} id
 * @param {object} payload – { reason }
 */
export async function cancelAppointment(id, payload = {}) {
  const res = await client.delete(`/appointments/${id}`, { data: payload })
  return res.data
}

/**
 * rescheduleAppointment
 * @param {number} id
 * @param {object} payload – { newSlotId, appointmentDate, appointmentTime }
 */
export async function rescheduleAppointment(id, payload) {
  const res = await client.put(`/appointments/${id}/reschedule`, payload)
  return res.data
}

export async function submitFeedback(id, payload) {
  const res = await client.post(`/appointments/${id}/feedback`, payload)
  return res.data
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminListAppointments(params = {}) {
  const res = await client.get('/appointments', { params })
  return res.data
}

export async function adminUpdateStatus(id, payload) {
  const res = await client.put(`/appointments/${id}/status`, payload)
  return res.data
}

export async function adminForceBook(id, payload) {
  const res = await client.post(`/appointments/${id}/force`, payload)
  return res.data
}

export async function adminCreateSection(payload) {
  const res = await client.post('/sections', payload)
  return res.data
}

export async function adminUpdateSection(id, payload) {
  const res = await client.put(`/sections/${id}`, payload)
  return res.data
}

export async function adminDeleteSection(id) {
  const res = await client.delete(`/sections/${id}`)
  return res.data
}

export async function adminUpdateSchedule(sectionId, schedules) {
  const res = await client.put(`/sections/${sectionId}/schedule`, { schedules })
  return res.data
}

export async function adminGetCapacity(sectionId, date) {
  const res = await client.get(`/sections/${sectionId}/capacity`, { params: { date } })
  return res.data.data
}

export async function adminSetCapacity(sectionId, payload) {
  const res = await client.post(`/sections/${sectionId}/capacity`, payload)
  return res.data
}

export async function adminGenerateSlots(payload) {
  const res = await client.post('/slots/generate', payload)
  return res.data
}

export async function adminBlockSlot(id) {
  const res = await client.put(`/slots/${id}/block`)
  return res.data
}

export async function adminUnblockSlot(id) {
  const res = await client.put(`/slots/${id}/unblock`)
  return res.data
}

export async function adminListTemplates() {
  const res = await client.get('/notifications/templates')
  return res.data.data
}

export async function adminUpdateTemplate(id, payload) {
  const res = await client.put(`/notifications/templates/${id}`, payload)
  return res.data
}

export async function adminGetNotificationLog(params = {}) {
  const res = await client.get('/notifications/log', { params })
  return res.data
}

const api = {
  getSections, getSection, getSlots,
  bookAppointment, getMyAppointments, getAppointment,
  cancelAppointment, rescheduleAppointment, submitFeedback,
  admin: {
    listAppointments: adminListAppointments,
    updateStatus: adminUpdateStatus,
    forceBook: adminForceBook,
    createSection: adminCreateSection,
    updateSection: adminUpdateSection,
    deleteSection: adminDeleteSection,
    updateSchedule: adminUpdateSchedule,
    getCapacity: adminGetCapacity,
    setCapacity: adminSetCapacity,
    generateSlots: adminGenerateSlots,
    blockSlot: adminBlockSlot,
    unblockSlot: adminUnblockSlot,
    listTemplates: adminListTemplates,
    updateTemplate: adminUpdateTemplate,
    getNotificationLog: adminGetNotificationLog
  }
}

export default api
