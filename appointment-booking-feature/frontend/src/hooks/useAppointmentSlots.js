import { useState, useEffect, useCallback, useRef } from 'react'
import { appointmentApi } from '@/lib/appointmentApi'

/**
 * Custom hook for fetching slot availability for a section on a given date.
 * Supports real-time polling for live updates.
 *
 * @param {number|string} sectionId
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {{ pollInterval?: number }} [options]
 * @returns {{ slots: object[], loading: boolean, error: string|null, refetch: () => void }}
 */
export function useAppointmentSlots(sectionId, date, options = {}) {
  const { pollInterval = 0 } = options

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const pollTimerRef = useRef(null)

  const fetchSlots = useCallback(async () => {
    if (!sectionId || !date) {
      setSlots([])
      return
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current()

    try {
      setLoading(true)
      setError(null)

      const response = await appointmentApi.getSlotAvailability(sectionId, date)

      if (response?.success) {
        setSlots(response.data || [])
      } else {
        setError(response?.message || 'Failed to load slots')
        setSlots([])
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError('Failed to fetch slot availability. Please try again.')
        setSlots([])
      }
    } finally {
      setLoading(false)
    }
  }, [sectionId, date])

  useEffect(() => {
    fetchSlots()

    if (pollInterval > 0) {
      pollTimerRef.current = setInterval(fetchSlots, pollInterval)
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [fetchSlots, pollInterval])

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
  }
}

export default useAppointmentSlots
