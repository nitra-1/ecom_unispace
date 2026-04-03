import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Select, DatePicker, Tag, Space, message } from 'antd'
import { LockOutlined, UnlockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import SlotOverridePanel from '../../components/appointments/SlotOverridePanel'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const { Option } = Select

/**
 * Admin page for manual slot management — block/unblock/force-book.
 */
const SlotManagement = () => {
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    if (selectedSectionId && selectedDate) {
      loadSlots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId, selectedDate])

  const loadSections = async () => {
    const res = await appointmentAdminApi.getAllSections()
    if (res?.success) {
      setSections(res.data || [])
      if (res.data?.length > 0) setSelectedSectionId(res.data[0].sectionId)
    }
  }

  const loadSlots = useCallback(async () => {
    if (!selectedSectionId) return
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getSlotAvailability(
        selectedSectionId,
        selectedDate.format('YYYY-MM-DD')
      )
      if (res?.success) {
        setSlots(res.data || [])
      } else {
        message.error(res?.message || 'Failed to load slots')
      }
    } catch {
      message.error('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }, [selectedSectionId, selectedDate])

  const openPanel = (slot) => {
    setActiveSlot(slot)
    setPanelOpen(true)
  }

  const handlePanelClose = () => {
    setPanelOpen(false)
    setActiveSlot(null)
    loadSlots()
  }

  const statusTag = (slot) => {
    if (slot.isBlocked) return <Tag color="default">Blocked</Tag>
    if (slot.availableCapacity === 0) return <Tag color="red">Full</Tag>
    const ratio = slot.availableCapacity / slot.totalCapacity
    if (ratio > 0.5) return <Tag color="green">Available</Tag>
    return <Tag color="orange">Limited</Tag>
  }

  const columns = [
    {
      title: 'Time',
      key: 'time',
      render: (_, r) => `${r.startTime} – ${r.endTime}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalCapacity',
      width: 80,
    },
    {
      title: 'Booked',
      dataIndex: 'bookedCount',
      width: 80,
    },
    {
      title: 'Available',
      dataIndex: 'availableCapacity',
      width: 90,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => statusTag(r),
    },
    {
      title: 'Block Reason',
      dataIndex: 'blockReason',
      ellipsis: true,
      render: (v) => v || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => openPanel(record)}
          >
            {record.isBlocked ? 'Unblock' : 'Block'}
          </Button>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => openPanel({ ...record, action: 'forceBook' })}
          >
            Force Book
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Slot Management</h2>

      <Space style={{ marginBottom: 16 }} size="middle">
        <Select
          value={selectedSectionId}
          onChange={setSelectedSectionId}
          style={{ width: 220 }}
          placeholder="Select section"
        >
          {sections.map((s) => (
            <Option key={s.sectionId} value={s.sectionId}>{s.sectionName}</Option>
          ))}
        </Select>

        <DatePicker
          value={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          format="YYYY-MM-DD"
        />

        <Button onClick={loadSlots} loading={loading}>
          Refresh
        </Button>
      </Space>

      <Table
        rowKey="slotId"
        dataSource={slots}
        columns={columns}
        loading={loading}
        pagination={false}
        bordered
      />

      <SlotOverridePanel
        slot={activeSlot}
        open={panelOpen}
        onClose={handlePanelClose}
      />
    </div>
  )
}

export default SlotManagement
