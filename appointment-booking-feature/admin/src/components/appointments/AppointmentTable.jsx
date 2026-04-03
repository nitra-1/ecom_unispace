import React, { useState } from 'react'
import { Table, Tag, Button, Modal, Space, Popconfirm, message, Descriptions } from 'antd'
import { EyeOutlined, CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

const STATUS_COLOR = {
  Pending: 'gold',
  Confirmed: 'green',
  Completed: 'blue',
  Cancelled: 'red',
  NoShow: 'default',
}

/**
 * Ant Design table for displaying customer appointments in the admin panel.
 * @param {{ dataSource: object[], loading: boolean, onStatusChange: Function, onRefresh: Function }} props
 */
const AppointmentTable = ({ dataSource, loading, onStatusChange, onRefresh }) => {
  const [viewingBooking, setViewingBooking] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const handleCancel = async (bookingId) => {
    try {
      setActionLoading(bookingId)
      const res = await appointmentAdminApi.cancelBooking(bookingId)
      if (res?.success) {
        message.success('Appointment cancelled')
        onStatusChange(bookingId, 'Cancelled')
      } else {
        message.error(res?.message || 'Cancel failed')
      }
    } catch {
      message.error('Cancel failed')
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    {
      title: 'Booking #',
      dataIndex: 'bookingNumber',
      sorter: (a, b) => a.bookingNumber.localeCompare(b.bookingNumber),
      render: (v) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      responsive: ['md'],
    },
    {
      title: 'Section',
      dataIndex: 'sectionName',
      filters: [...new Set((dataSource || []).map((d) => d.sectionName))].map((s) => ({
        text: s,
        value: s,
      })),
      onFilter: (value, record) => record.sectionName === value,
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, r) => (
        <div>
          <div>{r.slotDate}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{r.startTime} – {r.endTime}</div>
        </div>
      ),
      sorter: (a, b) =>
        new Date(`${a.slotDate}T${a.startTime}`) - new Date(`${b.slotDate}T${b.startTime}`),
    },
    {
      title: 'Type',
      dataIndex: 'appointmentType',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'bookingStatus',
      render: (status) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewingBooking(record)}
          >
            View
          </Button>
          {(record.bookingStatus === 'Confirmed' || record.bookingStatus === 'Pending') && (
            <Popconfirm
              title="Cancel this appointment?"
              onConfirm={() => handleCancel(record.bookingId)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                loading={actionLoading === record.bookingId}
              >
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table
        rowKey="bookingId"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} appointments` }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
      />

      {/* Booking Detail Modal */}
      <Modal
        title={`Booking Details — ${viewingBooking?.bookingNumber}`}
        open={!!viewingBooking}
        onCancel={() => setViewingBooking(null)}
        footer={[
          <Button key="close" onClick={() => setViewingBooking(null)}>Close</Button>,
        ]}
        width={600}
      >
        {viewingBooking && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Status" span={2}>
              <Tag color={STATUS_COLOR[viewingBooking.bookingStatus]}>
                {viewingBooking.bookingStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="First Name">{viewingBooking.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{viewingBooking.lastName}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingBooking.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{viewingBooking.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Section">{viewingBooking.sectionName}</Descriptions.Item>
            <Descriptions.Item label="Type">{viewingBooking.appointmentType}</Descriptions.Item>
            <Descriptions.Item label="Date">{viewingBooking.slotDate}</Descriptions.Item>
            <Descriptions.Item label="Time">
              {viewingBooking.startTime} – {viewingBooking.endTime}
            </Descriptions.Item>
            {viewingBooking.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {viewingBooking.notes}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Reminder Sent">
              {viewingBooking.reminderSent ? `Yes (${viewingBooking.reminderSentAt})` : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {viewingBooking.createdAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

export default AppointmentTable
