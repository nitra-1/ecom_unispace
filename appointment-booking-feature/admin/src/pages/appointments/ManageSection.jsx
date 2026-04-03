import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Popconfirm, Space, Tag, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import SectionForm from '../../components/appointments/SectionForm'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

/**
 * Admin page for managing appointment sections (CRUD).
 */
const ManageSection = () => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.getAllSections()
      if (res?.success) {
        setSections(res.data || [])
      } else {
        message.error(res?.message || 'Failed to load sections')
      }
    } catch {
      message.error('Failed to fetch sections')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingSection(null)
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingSection(record)
    setModalOpen(true)
  }

  const handleDelete = async (sectionId) => {
    try {
      const res = await appointmentAdminApi.deleteSection(sectionId)
      if (res?.success) {
        message.success('Section deleted')
        fetchSections()
      } else {
        message.error(res?.message || 'Delete failed')
      }
    } catch {
      message.error('Delete failed')
    }
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
    fetchSections()
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'sectionId',
      width: 60,
    },
    {
      title: 'Section Name',
      dataIndex: 'sectionName',
      sorter: (a, b) => a.sectionName.localeCompare(b.sectionName),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      render: (v) => v || '—',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (v) => v || '—',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (active) =>
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this section?"
            description="This will soft-delete the section (IsActive = false)."
            onConfirm={() => handleDelete(record.sectionId)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Manage Sections</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Section
        </Button>
      </div>

      <Table
        rowKey="sectionId"
        dataSource={sections}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        bordered
      />

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <SectionForm
          initialValues={editingSection}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default ManageSection
