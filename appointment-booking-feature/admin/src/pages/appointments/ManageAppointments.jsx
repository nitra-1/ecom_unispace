import React, { useEffect, useState, useCallback } from 'react'
import { Button, Select, DatePicker, Space, message } from 'antd'
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import AppointmentTable from '../../components/appointments/AppointmentTable'
import CustomerSearch from '../../components/appointments/CustomerSearch'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const { Option } = Select
const { RangePicker } = DatePicker

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow']

/**
 * Admin page for viewing and managing all customer appointments.
 */
const ManageAppointments = () => {
  const [sections, setSections] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    sectionId: '',
    dateRange: null,
    searchQuery: '',
  })

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadSections = async () => {
    const res = await appointmentAdminApi.getAllSections()
    if (res?.success) setSections(res.data || [])
  }

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.sectionId) params.append('sectionId', filters.sectionId)
      if (filters.dateRange?.[0]) params.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'))
      if (filters.dateRange?.[1]) params.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'))
      if (filters.searchQuery) params.append('query', filters.searchQuery)

      const res = await appointmentAdminApi.searchAppointments(params.toString())
      if (res?.success) {
        setAppointments(res.data || [])
      } else {
        message.error(res?.message || 'Failed to load appointments')
      }
    } catch {
      message.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleExport = () => {
    const csvRows = [
      ['BookingNumber', 'CustomerName', 'Email', 'Phone', 'Section', 'Date', 'Time', 'Type', 'Status'],
      ...appointments.map((a) => [
        a.bookingNumber,
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.phoneNumber,
        a.sectionName,
        a.slotDate,
        `${a.startTime}–${a.endTime}`,
        a.appointmentType,
        a.bookingStatus,
      ]),
    ]
    const csvContent = csvRows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${dayjs().format('YYYYMMDD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.bookingId === bookingId ? { ...a, bookingStatus: newStatus } : a))
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Manage Appointments</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport} disabled={appointments.length === 0}>
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <CustomerSearch
          onSearch={(query) => setFilters((f) => ({ ...f, searchQuery: query }))}
        />

        <Select
          value={filters.status || undefined}
          onChange={(v) => setFilters((f) => ({ ...f, status: v || '' }))}
          style={{ width: 160 }}
          allowClear
          placeholder="All Statuses"
        >
          {BOOKING_STATUSES.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Select>

        <Select
          value={filters.sectionId || undefined}
          onChange={(v) => setFilters((f) => ({ ...f, sectionId: v || '' }))}
          style={{ width: 200 }}
          allowClear
          placeholder="All Sections"
        >
          {sections.map((s) => (
            <Option key={s.sectionId} value={s.sectionId}>{s.sectionName}</Option>
          ))}
        </Select>

        <RangePicker
          value={filters.dateRange}
          onChange={(d) => setFilters((f) => ({ ...f, dateRange: d }))}
          format="YYYY-MM-DD"
        />
      </Space>

      <AppointmentTable
        dataSource={appointments}
        loading={loading}
        onStatusChange={handleStatusChange}
        onRefresh={fetchAppointments}
      />
    </div>
  )
}

export default ManageAppointments
