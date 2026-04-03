import React, { useEffect, useState } from 'react'
import { Button, Select, DatePicker, message, Card, Spin, Alert } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const { Option } = Select
const { RangePicker } = DatePicker

/**
 * Admin page for generating appointment slots based on capacity rules.
 */
const ManageSlots = () => {
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [dateRange, setDateRange] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const res = await appointmentAdminApi.getAllSections()
    if (res?.success) {
      setSections(res.data || [])
    }
  }

  const handleGenerate = async () => {
    if (!selectedSectionId) {
      message.warning('Please select a section')
      return
    }
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Please select a date range')
      return
    }

    const payload = {
      sectionId: selectedSectionId,
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    }

    try {
      setGenerating(true)
      setResult(null)
      const res = await appointmentAdminApi.generateSlots(payload)
      if (res?.success) {
        setResult({ type: 'success', message: res.message || 'Slots generated successfully!', data: res.data })
        message.success('Slots generated successfully')
      } else {
        setResult({ type: 'error', message: res?.message || 'Slot generation failed' })
        message.error(res?.message || 'Slot generation failed')
      }
    } catch {
      setResult({ type: 'error', message: 'An unexpected error occurred' })
      message.error('Slot generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Generate Appointment Slots</h2>

      <Card style={{ maxWidth: 640 }}>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          Select a section and date range to automatically generate appointment slots
          based on the configured capacity rules. Existing slots will not be overwritten.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Section</label>
          <Select
            value={selectedSectionId}
            onChange={setSelectedSectionId}
            style={{ width: '100%' }}
            placeholder="Select a section"
          >
            {sections.map((s) => (
              <Option key={s.sectionId} value={s.sectionId}>{s.sectionName}</Option>
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Date Range</label>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            format="YYYY-MM-DD"
          />
        </div>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGenerate}
          loading={generating}
          size="large"
          block
        >
          {generating ? 'Generating…' : 'Generate Slots'}
        </Button>

        {result && (
          <Alert
            style={{ marginTop: 16 }}
            type={result.type}
            message={result.message}
            description={
              result.data
                ? `${result.data.slotsCreated ?? 0} slots created, ${result.data.slotsSkipped ?? 0} skipped (already existed)`
                : undefined
            }
            showIcon
            closable
            onClose={() => setResult(null)}
          />
        )}
      </Card>
    </div>
  )
}

export default ManageSlots
