import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Popconfirm, Space, Select, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import CapacityForm from '../../components/appointments/CapacityForm'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const { Option } = Select

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Admin page for configuring capacity per section/day/hour.
 */
const ManageCapacity = () => {
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [capacityList, setCapacityList] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCapacity, setEditingCapacity] = useState(null)

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    if (selectedSectionId) loadCapacity(selectedSectionId)
  }, [selectedSectionId])

  const loadSections = async () => {
    const res = await appointmentAdminApi.getAllSections()
    if (res?.success) {
      setSections(res.data || [])
      if (res.data?.length > 0) setSelectedSectionId(res.data[0].sectionId)
    }
  }

  const loadCapacity = async (sectionId) => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getCapacityBySection(sectionId)
      if (res?.success) setCapacityList(res.data || [])
      else message.error(res?.message || 'Failed to load capacity')
    } catch {
      message.error('Failed to load capacity')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (capacityId) => {
    try {
      const res = await appointmentAdminApi.deleteCapacity(capacityId)
      if (res?.success) {
        message.success('Capacity rule deleted')
        loadCapacity(selectedSectionId)
      } else {
        message.error(res?.message || 'Delete failed')
      }
    } catch {
      message.error('Delete failed')
    }
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
    if (selectedSectionId) loadCapacity(selectedSectionId)
  }

  const columns = [
    { title: 'ID', dataIndex: 'capacityId', width: 60 },
    {
      title: 'Day of Week',
      dataIndex: 'dayOfWeek',
      render: (d, rec) =>
        rec.specificDate ? rec.specificDate : DAY_LABELS[d] ?? '—',
    },
    { title: 'Hour', dataIndex: 'hourOfDay', render: (h) => `${String(h).padStart(2, '0')}:00` },
    { title: 'Salespersons', dataIndex: 'salespersonCount' },
    { title: 'Duration (min)', dataIndex: 'appointmentDurationMinutes' },
    { title: 'Slots/Hour', dataIndex: 'slotsPerHour' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => { setEditingCapacity(record); setModalOpen(true) }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this capacity rule?"
            onConfirm={() => handleDelete(record.capacityId)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Manage Capacity</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingCapacity(null); setModalOpen(true) }}
        >
          Add Capacity Rule
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8, fontWeight: 500 }}>Section:</label>
        <Select
          value={selectedSectionId}
          onChange={setSelectedSectionId}
          style={{ width: 260 }}
          placeholder="Select a section"
        >
          {sections.map((s) => (
            <Option key={s.sectionId} value={s.sectionId}>{s.sectionName}</Option>
          ))}
        </Select>
      </div>

      <Table
        rowKey="capacityId"
        dataSource={capacityList}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingCapacity ? 'Edit Capacity Rule' : 'Add Capacity Rule'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <CapacityForm
          initialValues={editingCapacity || { sectionId: selectedSectionId }}
          sections={sections}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default ManageCapacity
