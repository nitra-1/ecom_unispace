/**
 * useAppointments.js
 *
 * Custom React hook that provides appointment data and actions
 * for both the customer and admin views.
 *
 * Usage (customer):
 *   const { appointments, loading, cancelAppointment } = useAppointments({ userId })
 *
 * Usage (admin):
 *   const { appointments, loading, updateStatus } = useAppointments({ isAdmin: true })
 */

import { useState, useEffect, useCallback } from 'react'
import api from '../api/appointmentApi'

export default function useAppointments(options = {}) {
  const {
    userId,
    isAdmin = false,
    sectionId,
    status,
    date,
    pageIndex = 1,
    pageSize = 10
  } = options

  const [appointments, setAppointments] = useState([])
  const [pagination, setPagination] = useState({ recordCount: 0, pageCount: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { pageIndex, pageSize }
      if (userId) params.userId = userId
      if (sectionId) params.sectionId = sectionId
      if (status) params.status = status
      if (date) params.date = date

      const response = isAdmin
        ? await api.admin.listAppointments(params)
        : await api.getMyAppointments(params)

      setAppointments(response.data || [])
      setPagination(response.pagination || { recordCount: 0, pageCount: 0 })
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isAdmin, sectionId, status, date, pageIndex, pageSize])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const cancelAppointment = async (id, reason) => {
    try {
      await api.cancelAppointment(id, { reason, cancelledBy: isAdmin ? 'admin' : 'customer' })
      await fetchAppointments()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    }
  }

  const updateStatus = async (id, status, notes) => {
    try {
      await api.admin.updateStatus(id, { status, notes })
      await fetchAppointments()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    }
  }

  return {
    appointments,
    pagination,
    loading,
    error,
    refetch: fetchAppointments,
    cancelAppointment,
    updateStatus
  }
}
