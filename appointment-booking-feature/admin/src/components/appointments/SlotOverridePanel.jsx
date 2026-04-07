import React, { useState } from 'react'
import { Drawer, Button, Input, Form, Space, Tag, Descriptions, message } from 'antd'
import { LockOutlined, UnlockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

/**
 * Slide-over panel to block, unblock, or force-book a slot.
 * @param {{ slot: object|null, open: boolean, onClose: () => void }} props
 */
const SlotOverridePanel = ({ slot, open, onClose }) => {
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [forceBookForm] = Form.useForm()

  const isForceBook = slot?.action === 'forceBook'

  const handleBlock = async () => {
    if (!blockReason.trim()) {
      message.warning('Please enter a reason for blocking')
      return
    }
    try {
      setLoading(true)
      const res = await appointmentAdminApi.blockSlot({
        slotId: slot.slotId,
        blockReason: blockReason.trim(),
      })
      if (res?.success) {
        message.success('Slot blocked successfully')
        setBlockReason('')
        onClose()
      } else {
        message.error(res?.message || 'Failed to block slot')
      }
    } catch {
      message.error('Failed to block slot')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async () => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.unblockSlot({ slotId: slot.slotId })
      if (res?.success) {
        message.success('Slot unblocked')
        onClose()
      } else {
        message.error(res?.message || 'Failed to unblock slot')
      }
    } catch {
      message.error('Failed to unblock slot')
    } finally {
      setLoading(false)
    }
  }

  const handleForceBook = async (values) => {
    try {
      setLoading(true)
      const res = await appointmentAdminApi.forceBookSlot({
        slotId: slot.slotId,
        ...values,
      })
      if (res?.success) {
        message.success(`Force booked: ${res.data?.bookingNumber}`)
        forceBookForm.resetFields()
        onClose()
      } else {
        message.error(res?.message || 'Force book failed')
      }
    } catch {
      message.error('Force book failed')
    } finally {
      setLoading(false)
    }
  }

  const slotStatusTag = slot?.isBlocked ? (
    <Tag color="default">Blocked</Tag>
  ) : slot?.availableCapacity === 0 ? (
    <Tag color="red">Full</Tag>
  ) : (
    <Tag color="green">Available</Tag>
  )

  return (
    <Drawer
      title="Slot Override"
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      footer={null}
    >
      {slot && (
        <>
          {/* Slot Details */}
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Slot ID">{slot.slotId}</Descriptions.Item>
            <Descriptions.Item label="Time">
              {slot.startTime} – {slot.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="Capacity">
              {slot.bookedCount}/{slot.totalCapacity} booked ({slot.availableCapacity} left)
            </Descriptions.Item>
            <Descriptions.Item label="Status">{slotStatusTag}</Descriptions.Item>
            {slot.blockReason && (
              <Descriptions.Item label="Block Reason">{slot.blockReason}</Descriptions.Item>
            )}
          </Descriptions>

          {/* Force book form */}
          {isForceBook ? (
            <div>
              <h4 style={{ marginBottom: 16 }}>Force Book Slot</h4>
              <Form form={forceBookForm} layout="vertical" onFinish={handleForceBook}>
                <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                  <Input placeholder="John" />
                </Form.Item>
                <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                  <Input placeholder="Smith" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="john@example.com" />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Phone" rules={[{ required: true }]}>
                  <Input placeholder="+91 98765 43210" />
                </Form.Item>
                <Form.Item name="appointmentType" label="Appointment Type" initialValue="Consultation">
                  <Input />
                </Form.Item>
                <Form.Item name="notes" label="Notes">
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<ThunderboltOutlined />} block>
                  Force Book
                </Button>
              </Form>
            </div>
          ) : (
            <div>
              {/* Block / Unblock actions */}
              {slot.isBlocked ? (
                <div>
                  <p style={{ marginBottom: 16, color: '#6b7280' }}>
                    This slot is currently blocked. Click below to make it available again.
                  </p>
                  <Button
                    type="primary"
                    icon={<UnlockOutlined />}
                    onClick={handleUnblock}
                    loading={loading}
                    block
                  >
                    Unblock Slot
                  </Button>
                </div>
              ) : (
                <div>
                  <h4 style={{ marginBottom: 12 }}>Block Slot</h4>
                  <p style={{ marginBottom: 12, color: '#6b7280' }}>
                    Blocking this slot will prevent any new bookings.
                  </p>
                  <Input.TextArea
                    rows={3}
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason for blocking (e.g., Staff training)"
                    style={{ marginBottom: 12 }}
                    maxLength={500}
                    showCount
                  />
                  <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                      danger
                      type="primary"
                      icon={<LockOutlined />}
                      onClick={handleBlock}
                      loading={loading}
                      disabled={!blockReason.trim()}
                    >
                      Block Slot
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Drawer>
  )
}

export default SlotOverridePanel
