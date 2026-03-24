import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Select, Space,
  Modal, Form, InputNumber, Input, message, Divider, Timeline,
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const STATUS_COLORS = {
  pending: 'orange', confirmed: 'blue', completed: 'green', cancelled: 'red',
};
const STATUS_ORDER = ['pending', 'confirmed', 'completed', 'cancelled'];

const BASE_URL = 'https://api.aparna.hashtechy.space/api/';

async function apiFetch(endpoint, options = {}) {
  const token = document.cookie.match(/userToken=([^;]+)/)?.[1] ?? '';
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });
  return res.json();
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`Appointment/${id}`);
      setAppointment(data?.data ?? null);
      if (data?.data?.quoteId) {
        const qData = await apiFetch(`Quote/ByAppointment?appointmentId=${id}`);
        setQuote(qData?.data ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return message.error('Please select a status.');
    await apiFetch('Appointment/UpdateStatus', {
      method: 'PUT',
      body: JSON.stringify({ appointmentId: Number(id), status: newStatus, actorId: 'admin' }),
    });
    message.success(`Status updated to ${newStatus}.`);
    setStatusModal(false);
    load();
  };

  const handleRaiseQuote = async (values) => {
    const payload = {
      appointmentId: Number(id),
      userId: appointment.userId,
      items: values.items,
    };
    const data = await apiFetch('Quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data?.data?.quoteId) {
      message.success('Quote raised successfully.');
      setQuoteModal(false);
      quoteForm.resetFields();
      load();
    } else {
      message.error('Failed to raise quote.');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!appointment) return <div style={{ padding: 24 }}>Appointment not found.</div>;

  const {
    referenceNo, category, appointmentType, appointmentDate,
    startTime, endTime, status, specialistName, meetingLink,
    notes, orderId,
  } = appointment;

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/appointments')}>← Back</Button>
        <h2 style={{ margin: 0 }}>Appointment Detail</h2>
      </Space>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Reference No">{referenceNo}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[status]}>{status?.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Category" span={1}>
            <span style={{ textTransform: 'capitalize' }}>{category}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Type" span={1}>
            <span style={{ textTransform: 'capitalize' }}>{appointmentType}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {dayjs(appointmentDate).format('DD MMM YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Time">{startTime} – {endTime}</Descriptions.Item>
          <Descriptions.Item label="Specialist">
            {specialistName ?? <span style={{ color: '#aaa' }}>Not yet assigned</span>}
          </Descriptions.Item>
          {meetingLink && (
            <Descriptions.Item label="Meeting Link">
              <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
            </Descriptions.Item>
          )}
          {notes && (
            <Descriptions.Item label="Customer Notes" span={2}>{notes}</Descriptions.Item>
          )}
          {orderId && (
            <Descriptions.Item label="Linked Order">#{orderId}</Descriptions.Item>
          )}
        </Descriptions>

        {/* Status Timeline */}
        <Divider orientation="left">Status Timeline</Divider>
        <Timeline
          items={STATUS_ORDER.filter((s) => s !== 'cancelled').map((s) => ({
            color: STATUS_ORDER.indexOf(s) <= STATUS_ORDER.indexOf(status) ? 'blue' : 'gray',
            children: s.charAt(0).toUpperCase() + s.slice(1),
          }))}
        />

        {/* Actions */}
        <Divider orientation="left">Actions</Divider>
        <Space wrap>
          {status !== 'cancelled' && status !== 'completed' && (
            <Button type="primary" onClick={() => setStatusModal(true)}>
              Update Status
            </Button>
          )}
          {status === 'completed' && !appointment.quoteId && (
            <Button onClick={() => setQuoteModal(true)}>Raise Quote</Button>
          )}
          {quote && (
            <Button href={`/checkout?quoteId=${quote.quoteId}`} target="_blank">
              View Quote
            </Button>
          )}
        </Space>
      </Card>

      {/* Update Status Modal */}
      <Modal
        title="Update Appointment Status"
        open={statusModal}
        onOk={handleUpdateStatus}
        onCancel={() => setStatusModal(false)}
        okText="Update"
      >
        <Select
          placeholder="Select new status"
          style={{ width: '100%' }}
          onChange={setNewStatus}
        >
          {['confirmed', 'completed', 'cancelled'].map((s) => (
            <Option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Option>
          ))}
        </Select>
      </Modal>

      {/* Raise Quote Modal */}
      <Modal
        title="Raise Quote"
        open={quoteModal}
        onOk={() => quoteForm.submit()}
        onCancel={() => setQuoteModal(false)}
        okText="Submit Quote"
        width={600}
      >
        <Form form={quoteForm} onFinish={handleRaiseQuote} layout="vertical">
          <Form.List name="items" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" wrap style={{ marginBottom: 8 }}>
                    <Form.Item {...rest} name={[name, 'productName']} label="Product" rules={[{ required: true }]}>
                      <Input placeholder="Product name" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'qty']} label="Qty" rules={[{ required: true }]}>
                      <InputNumber min={1} placeholder="Qty" style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'unitPrice']} label="Unit Price (₹)" rules={[{ required: true }]}>
                      <InputNumber min={0} placeholder="Price" style={{ width: 120 }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>Remove</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>+ Add Item</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
