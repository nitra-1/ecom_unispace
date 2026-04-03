import { useState, useEffect, useCallback } from 'react'
import { appointmentApi } from '@/lib/appointmentApi'

/**
 * Custom hook that fetches all active appointment sections.
 *
 * @returns {{ sections: object[], loading: boolean, error: string|null, refetch: () => void }}
 */
export function useSectionData() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await appointmentApi.getAllSections()

      if (response?.success) {
        setSections(response.data || [])
      } else {
        setError(response?.message || 'Failed to load sections')
        setSections([])
      }
    } catch (err) {
      setError('Failed to fetch sections. Please try again.')
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
  }
}

export default useSectionData
