'use client'
/**
 * NotificationSettings.jsx  [Admin]
 *
 * Allows admins to:
 *   - View and edit email notification templates
 *   - Enable / disable templates
 *   - View the notification log (sent / failed / pending)
 *
 * Templates use {{variable}} placeholders (see backend seed for full list).
 */

import React, { useState, useEffect } from 'react'
import {
  adminListTemplates,
  adminUpdateTemplate,
  adminGetNotificationLog
} from '../../api/appointmentApi'

const PLACEHOLDER_DOCS = `Available placeholders:
  {{booking_id}}        — e.g. APT-20240402-0001
  {{user_name}}         — customer's full name
  {{user_email}}        — customer's email
  {{section_name}}      — section name (Kitchen, Wardrobe, …)
  {{appointment_date}}  — appointment date (YYYY-MM-DD)
  {{appointment_time}}  — appointment time (HH:MM)
  {{cancellation_reason}} — reason for cancellation`

export default function NotificationSettings() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  // Log tab
  const [activeTab, setActiveTab] = useState('templates')
  const [log, setLog] = useState([])
  const [logLoading, setLogLoading] = useState(false)
  const [logPage, setLogPage] = useState(1)
  const [logPagination, setLogPagination] = useState({ pageCount: 0, recordCount: 0 })

  useEffect(() => {
    adminListTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab !== 'log') return
    loadLog()
  }, [activeTab, logPage])

  async function loadLog() {
    setLogLoading(true)
    try {
      const result = await adminGetNotificationLog({ pageIndex: logPage, pageSize: 30 })
      setLog(result.data)
      setLogPagination(result.pagination)
    } catch {
      setLog([])
    } finally {
      setLogLoading(false)
    }
  }

  function openEdit(template) {
    setEditingTemplate(template)
    setFormData({ subject: template.subject || '', body: template.body || '', is_active: template.is_active })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await adminUpdateTemplate(editingTemplate.id, formData)
      const updated = await adminListTemplates()
      setTemplates(updated)
      setEditingTemplate(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['templates', 'log'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'log' ? 'Notification Log' : 'Email Templates'}
          </button>
        ))}
      </div>

      {/* ── Templates tab ── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{tmpl.name}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    tmpl.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tmpl.is_active ? 'Active' : 'Disabled'}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">{tmpl.channel}</span>
                </div>
                {tmpl.subject && (
                  <p className="mt-1 text-sm text-gray-500">Subject: {tmpl.subject}</p>
                )}
                <p className="mt-1 text-xs text-gray-400 truncate max-w-lg">
                  {tmpl.body.substring(0, 120)}…
                </p>
              </div>
              <button
                onClick={() => openEdit(tmpl)}
                className="shrink-0 text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Log tab ── */}
      {activeTab === 'log' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">{logPagination.recordCount} notifications total</p>
          {logLoading && <p className="text-gray-400 text-sm">Loading log…</p>}
          {!logLoading && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Template', 'Channel', 'Recipient', 'Status', 'Sent At'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {log.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.template_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{entry.channel}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.recipient}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.status === 'sent' ? 'bg-green-100 text-green-700'
                          : entry.status === 'failed' ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {entry.sent_at ? new Date(entry.sent_at).toLocaleString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))}
                  {log.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No log entries yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {logPagination.pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40">← Previous</button>
              <span className="text-sm text-gray-500">Page {logPage} of {logPagination.pageCount}</span>
              <button onClick={() => setLogPage((p) => Math.min(logPagination.pageCount, p + 1))} disabled={logPage === logPagination.pageCount}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* Edit template modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="font-semibold text-gray-800">Edit Template — {editingTemplate.name}</h3>
              <button onClick={() => setEditingTemplate(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (email only)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                />
                <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">{PLACEHOLDER_DOCS}</pre>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Template Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingTemplate(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
