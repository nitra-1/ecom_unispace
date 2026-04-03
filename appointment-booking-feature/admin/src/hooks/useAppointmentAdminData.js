import { useState, useEffect, useCallback } from 'react'
import { appointmentAdminApi } from '../lib/appointmentAdminApi'

/**
 * Hook for fetching all sections.
 * @returns {{ sections, loading, error, refetch }}
 */
export function useSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getAllSections()
      if (res?.success) setSections(res.data || [])
      else setError(res?.message || 'Failed to load sections')
    } catch {
      setError('Failed to load sections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { sections, loading, error, refetch: fetch }
}

/**
 * Hook for fetching capacity rules for a section.
 * @param {number|null} sectionId
 * @returns {{ capacity, loading, error, refetch }}
 */
export function useCapacity(sectionId) {
  const [capacity, setCapacity] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!sectionId) return
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getCapacityBySection(sectionId)
      if (res?.success) setCapacity(res.data || [])
      else setError(res?.message || 'Failed to load capacity')
    } catch {
      setError('Failed to load capacity')
    } finally {
      setLoading(false)
    }
  }, [sectionId])

  useEffect(() => { fetch() }, [fetch])
  return { capacity, loading, error, refetch: fetch }
}

/**
 * Hook for fetching slot availability for a section+date.
 * @param {number|null} sectionId
 * @param {string|null} date - YYYY-MM-DD
 * @returns {{ slots, loading, error, refetch }}
 */
export function useSlots(sectionId, date) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!sectionId || !date) return
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getSlotAvailability(sectionId, date)
      if (res?.success) setSlots(res.data || [])
      else setError(res?.message || 'Failed to load slots')
    } catch {
      setError('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }, [sectionId, date])

  useEffect(() => { fetch() }, [fetch])
  return { slots, loading, error, refetch: fetch }
}

/**
 * Hook for searching/fetching appointments with a query string.
 * @param {string} queryString
 * @returns {{ appointments, loading, error, refetch }}
 */
export function useAppointments(queryString = '') {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.searchAppointments(queryString)
      if (res?.success) setAppointments(res.data || [])
      else setError(res?.message || 'Failed to load appointments')
    } catch {
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => { fetch() }, [fetch])
  return { appointments, loading, error, refetch: fetch }
}
