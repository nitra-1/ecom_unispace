import React, { useEffect, useState } from 'react';
import {
  Calendar, Select, Button, Modal, Form, Input, Space, message, Badge, Tooltip,
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const BASE_URL = 'https://api.aparna.hashtechy.space/api/';
const CATEGORIES = ['tiles', 'kitchen', 'wardrobe', 'flooring', 'lighting'];
const TYPES = ['virtual', 'inperson'];

async function apiFetch(endpoint, options = {}) {
  const token = document.cookie.match(/userToken=([^;]+)/)?.[1] ?? '';
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...options,
  });
  return res.json();
}

export default function SlotManager() {
  const [category, setCategory] = useState('tiles');
  const [type, setType] = useState('virtual');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockModal, setBlockModal] = useState({ open: false, slot: null });
  const [blockForm] = Form.useForm();

  const loadSlots = async () => {
    if (!category || !type || !selectedDate) return;
    setLoading(true);
    try {
      const data = await apiFetch(
        `Appointment/Slots?category=${category}&type=${type}&date=${selectedDate.format('YYYY-MM-DD')}`
      );
      setSlots(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); }, [category, type, selectedDate]);

  const handleBlockSlot = async (values) => {
    const { reason } = values;
    const slot = blockModal.slot;
    await apiFetch('Appointment/Slots/Block', {
      method: 'POST',
      body: JSON.stringify({
        slotIds: [slot.slotId],
        date: selectedDate.format('YYYY-MM-DD'),
        category,
        appointmentType: type,
        reason,
      }),
    });
    message.success(`Slot ${slot.startTime}–${slot.endTime} blocked.`);
    setBlockModal({ open: false, slot: null });
    blockForm.resetFields();
    loadSlots();
  };

  const dateCellRender = (value) => {
    // Simple indicator – highlight selected date
    if (value.isSame(selectedDate, 'day')) {
      return <Badge status="processing" />;
    }
    return null;
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Slot Manager</h2>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select value={category} style={{ width: 140 }} onChange={setCategory}>
          {CATEGORIES.map((c) => (
            <Option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</Option>
          ))}
        </Select>

        <Select value={type} style={{ width: 140 }} onChange={setType}>
          {TYPES.map((t) => (
            <Option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</Option>
          ))}
        </Select>
      </Space>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Calendar */}
        <div style={{ flex: '0 0 300px' }}>
          <Calendar
            fullscreen={false}
            cellRender={dateCellRender}
            onSelect={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Slot grid */}
        <div style={{ flex: 1 }}>
          <h3>{selectedDate.format('DD MMM YYYY')} – Time Slots</h3>
          {loading && <p>Loading slots…</p>}
          {!loading && slots.length === 0 && (
            <p style={{ color: '#aaa' }}>No slots defined for this category and type.</p>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginTop: 8,
            }}
          >
            {slots.map((slot) => {
              const bg = slot.isAvailable ? '#d4f8d4' : '#f8d4d4';
              const border = slot.isAvailable ? '#28a745' : '#dc3545';
              const statusLabel = slot.isAvailable ? 'Available' : 'Blocked / Booked';
              return (
                <Tooltip key={slot.slotId} title={statusLabel}>
                  <div
                    style={{
                      padding: '10px',
                      textAlign: 'center',
                      borderRadius: 6,
                      border: `1px solid ${border}`,
                      background: bg,
                      fontSize: 13,
                      cursor: slot.isAvailable ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (slot.isAvailable) {
                        setBlockModal({ open: true, slot });
                      }
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{slot.startTime} – {slot.endTime}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{statusLabel}</div>
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#555' }}>
            <span>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#28a745', marginRight: 4, verticalAlign: 'middle' }} />
              Available (click to block)
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#dc3545', marginRight: 4, verticalAlign: 'middle' }} />
              Blocked / Booked
            </span>
          </div>
        </div>
      </div>

      {/* Block Slot Modal */}
      <Modal
        title={`Block Slot: ${blockModal.slot?.startTime} – ${blockModal.slot?.endTime}`}
        open={blockModal.open}
        onOk={() => blockForm.submit()}
        onCancel={() => setBlockModal({ open: false, slot: null })}
        okText="Block Slot"
      >
        <Form form={blockForm} onFinish={handleBlockSlot} layout="vertical">
          <Form.Item name="reason" label="Reason (optional)">
            <Input placeholder="e.g. Public holiday, Specialist leave" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
