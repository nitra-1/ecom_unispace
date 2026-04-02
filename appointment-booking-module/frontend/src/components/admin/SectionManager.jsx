'use client'
/**
 * SectionManager.jsx  [Admin]
 *
 * CRUD interface for showroom sections.
 * Allows admins to:
 *   - View all sections (active and inactive)
 *   - Create a new section
 *   - Edit an existing section (name, description, location, duration, icon)
 *   - Deactivate / soft-delete a section
 *   - View and update the weekly operating schedule per section
 *
 * This component is self-contained and uses the appointmentApi helper.
 */

import React, { useState, useEffect } from 'react'
import {
  getSections,
  adminCreateSection,
  adminUpdateSection,
  adminDeleteSection,
  adminUpdateSchedule
} from '../../api/appointmentApi'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EMPTY_SECTION = {
  name: '',
  slug: '',
  description: '',
  location: '',
  icon_url: '',
  image_url: '',
  appointment_duration_minutes: 60
}

export default function SectionManager() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [formData, setFormData] = useState(EMPTY_SECTION)
  const [saving, setSaving] = useState(false)
  const [scheduleSection, setScheduleSection] = useState(null) // section whose schedule is being edited
  const [scheduleData, setScheduleData] = useState([])

  async function load() {
    setLoading(true)
    try {
      const data = await getSections()
      setSections(data)
    } catch {
      setError('Failed to load sections.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingSection(null)
    setFormData(EMPTY_SECTION)
    setShowForm(true)
  }

  function openEdit(section) {
    setEditingSection(section)
    setFormData({
      name: section.name,
      slug: section.slug,
      description: section.description || '',
      location: section.location || '',
      icon_url: section.icon_url || '',
      image_url: section.image_url || '',
      appointment_duration_minutes: section.appointment_duration_minutes || 60
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.slug) {
      alert('Name and slug are required.')
      return
    }
    setSaving(true)
    try {
      if (editingSection) {
        await adminUpdateSection(editingSection.id, formData)
      } else {
        await adminCreateSection(formData)
      }
      setShowForm(false)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deactivate this section?')) return
    try {
      await adminDeleteSection(id)
      await load()
    } catch {
      alert('Failed to deactivate section.')
    }
  }

  async function openSchedule(section) {
    // Load the section with its schedule
    const { getSection } = await import('../../api/appointmentApi')
    const data = await getSection(section.id)
    // Fill in missing days
    const fullSchedule = DAY_NAMES.map((_, dow) => {
      const existing = data.schedules?.find((s) => s.day_of_week === dow)
      return existing || { day_of_week: dow, open_time: '10:00', close_time: '19:00', is_open: dow !== 0 }
    })
    setScheduleData(fullSchedule)
    setScheduleSection(section)
  }

  async function saveSchedule() {
    setSaving(true)
    try {
      await adminUpdateSchedule(scheduleSection.id, scheduleData)
      setScheduleSection(null)
    } catch {
      alert('Failed to save schedule.')
    } finally {
      setSaving(false)
    }
  }

  function updateScheduleRow(dow, field, value) {
    setScheduleData((prev) =>
      prev.map((row) => row.day_of_week === dow ? { ...row, [field]: value } : row)
    )
  }

  if (loading) return <div className="p-6 text-gray-500">Loading sections…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Manage Sections</h2>
        <button
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Section
        </button>
      </div>

      {/* Sections table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Slug', 'Location', 'Duration (min)', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sections.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{s.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.location || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 text-center">
                  {s.appointment_duration_minutes}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => openSchedule(s)} className="text-xs text-purple-600 hover:underline">Schedule</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit form modal */}
      {showForm && (
        <Modal title={editingSection ? 'Edit Section' : 'Create Section'} onClose={() => setShowForm(false)}>
          <FormField label="Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
          <FormField
            label="Slug *"
            value={formData.slug}
            onChange={(v) => setFormData({ ...formData, slug: v.toLowerCase().replace(/\s+/g, '-') })}
            hint="URL-friendly identifier, e.g. kitchen"
          />
          <FormField label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} textarea />
          <FormField label="Location" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} />
          <FormField label="Icon URL" value={formData.icon_url} onChange={(v) => setFormData({ ...formData, icon_url: v })} />
          <FormField label="Image URL" value={formData.image_url} onChange={(v) => setFormData({ ...formData, image_url: v })} />
          <FormField
            label="Appointment Duration (minutes)"
            type="number"
            value={formData.appointment_duration_minutes}
            onChange={(v) => setFormData({ ...formData, appointment_duration_minutes: parseInt(v) || 60 })}
          />
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Section'}
            </button>
          </div>
        </Modal>
      )}

      {/* Schedule editor modal */}
      {scheduleSection && (
        <Modal title={`Operating Hours — ${scheduleSection.name}`} onClose={() => setScheduleSection(null)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Day</th>
                <th className="py-2 pr-4">Open</th>
                <th className="py-2 pr-4">Close</th>
                <th className="py-2">Open?</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((row) => (
                <tr key={row.day_of_week} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-medium">{DAY_NAMES[row.day_of_week]}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="time"
                      value={row.open_time}
                      onChange={(e) => updateScheduleRow(row.day_of_week, 'open_time', e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      disabled={!row.is_open}
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="time"
                      value={row.close_time}
                      onChange={(e) => updateScheduleRow(row.day_of_week, 'close_time', e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      disabled={!row.is_open}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={row.is_open}
                      onChange={(e) => updateScheduleRow(row.day_of_week, 'is_open', e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setScheduleSection(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveSchedule} disabled={saving} className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Schedule'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Reusable helpers ──────────────────────────────────────────────────────────

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, textarea, hint, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
