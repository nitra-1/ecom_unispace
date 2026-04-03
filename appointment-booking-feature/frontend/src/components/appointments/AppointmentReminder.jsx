'use client'

import { useEffect, useState } from 'react'
import { appointmentApi } from '@/lib/appointmentApi'
import { REMINDER_OPTIONS } from '@/utils/appointmentConstants'

/**
 * Reminder preferences form for a customer.
 * @param {{ customerId: string }} props
 */
export default function AppointmentReminder({ customerId }) {
  const [prefs, setPrefs] = useState({
    reminderDaysBefore: 1,
    reminderHourBefore: 2,
    enableEmailReminder: true,
    enableSmsReminder: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!customerId) return
    ;(async () => {
      try {
        const res = await appointmentApi.getReminderPreferences(customerId)
        if (res?.success && res.data) {
          setPrefs(res.data)
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false)
      }
    })()
  }, [customerId])

  const handleChange = (field, value) => {
    setPrefs((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const res = await appointmentApi.updateReminderPreferences(customerId, prefs)
      if (res?.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully.' })
      } else {
        setMessage({ type: 'error', text: res?.message || 'Failed to save preferences.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save preferences.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  if (loading) {
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Days before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remind me (days before)
          </label>
          <select
            value={prefs.reminderDaysBefore}
            onChange={(e) =>
              handleChange('reminderDaysBefore', parseInt(e.target.value, 10))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REMINDER_OPTIONS.days.map((d) => (
              <option key={d} value={d}>
                {d} day{d !== 1 ? 's' : ''} before
              </option>
            ))}
          </select>
        </div>

        {/* Hours before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remind me (hours before)
          </label>
          <select
            value={prefs.reminderHourBefore}
            onChange={(e) =>
              handleChange('reminderHourBefore', parseInt(e.target.value, 10))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REMINDER_OPTIONS.hours.map((h) => (
              <option key={h} value={h}>
                {h} hour{h !== 1 ? 's' : ''} before
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle options */}
      <div className="space-y-3 mb-6">
        <Toggle
          label="Email Reminder"
          description="Receive appointment reminders via email"
          checked={prefs.enableEmailReminder}
          onChange={(v) => handleChange('enableEmailReminder', v)}
        />
        <Toggle
          label="SMS Reminder"
          description="Receive appointment reminders via SMS"
          checked={prefs.enableSmsReminder}
          onChange={(v) => handleChange('enableSmsReminder', v)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
