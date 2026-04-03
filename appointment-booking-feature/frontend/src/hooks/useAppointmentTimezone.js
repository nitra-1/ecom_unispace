import { useState, useEffect, useCallback } from 'react'
import { TIME_FORMAT } from '@/utils/appointmentConstants'

/**
 * Custom hook that converts slot UTC times to the user's local timezone.
 *
 * @param {string|null} utcDateStr - ISO date string
 * @param {string|null} utcTimeStr - Time string (HH:mm or HH:mm:ss)
 * @returns {{ localDate: string, localTime: string, timezone: string, offset: string }}
 */
export function useAppointmentTimezone(utcDateStr = null, utcTimeStr = null) {
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)

  const convert = useCallback(() => {
    if (!utcDateStr || !utcTimeStr) {
      return { localDate: '', localTime: '', timezone, offset: '' }
    }

    try {
      const dateTime = new Date(`${utcDateStr}T${utcTimeStr}Z`)

      const localDate = dateTime.toLocaleDateString('en-IN', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const localTime = dateTime.toLocaleTimeString('en-IN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      const offsetMin = -dateTime.getTimezoneOffset()
      const sign = offsetMin >= 0 ? '+' : '-'
      const absMin = Math.abs(offsetMin)
      const hours = String(Math.floor(absMin / 60)).padStart(2, '0')
      const mins = String(absMin % 60).padStart(2, '0')
      const offset = `UTC${sign}${hours}:${mins}`

      return { localDate, localTime, timezone, offset }
    } catch {
      return { localDate: utcDateStr, localTime: utcTimeStr, timezone, offset: '' }
    }
  }, [utcDateStr, utcTimeStr, timezone])

  const [result, setResult] = useState(convert)

  useEffect(() => {
    setResult(convert())
  }, [convert])

  return result
}

export default useAppointmentTimezone
