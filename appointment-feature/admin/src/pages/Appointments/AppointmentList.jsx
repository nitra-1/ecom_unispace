import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Select, DatePicker, Space, Modal, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  pending:   'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
};

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

export default function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', category: '', dateRange: [] });
  const [assignModal, setAssignModal] = useState({ open: false, appointmentId: null });
  const [assignSpecialistId, setAssignSpecialistId] = useState(null);
  const connectionRef = useRef(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.dateRange?.length === 2) {
        params.set('from', filters.dateRange[0].format('YYYY-MM-DD'));
        params.set('to', filters.dateRange[1].format('YYYY-MM-DD'));
      }
      const data = await apiFetch(`Appointment/All?${params.toString()}`);
      setAppointments(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialists = async () => {
    const data = await apiFetch('Specialist/All');
    setSpecialists(data?.data ?? []);
  };

  // SignalR – listen for new bookings in real time
  useEffect(() => {
    let connection = null;
    (async () => {
      try {
        const { HubConnectionBuilder } = await import('@microsoft/signalr');
        connection = new HubConnectionBuilder()
          .withUrl(`${BASE_URL.replace('/api/', '')}/hubs/appointment`)
          .withAutomaticReconnect()
          .build();
        connection.on('newAppointment', (data) => {
          message.info(`New booking: ${data.referenceNo}`);
          setAppointments((prev) => [data, ...prev]);
        });
        await connection.start();
        connectionRef.current = connection;
      } catch {
        // SignalR optional – graceful degradation
      }
    })();
    return () => { connection?.stop(); };
  }, []);

  useEffect(() => {
    loadAppointments();
    loadSpecialists();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleAssignSave = async () => {
    if (!assignSpecialistId) return message.error('Please select a specialist.');
    await apiFetch('Appointment/AssignSpecialist', {
      method: 'PUT',
      body: JSON.stringify({
        appointmentId: assignModal.appointmentId,
        specialistId: assignSpecialistId,
      }),
    });
    message.success('Specialist assigned successfully.');
    setAssignModal({ open: false, appointmentId: null });
    setAssignSpecialistId(null);
    loadAppointments();
  };

  const columns = [
    { title: 'Reference No', dataIndex: 'referenceNo', key: 'referenceNo', width: 180 },
    { title: 'Category', dataIndex: 'category', key: 'category',
      render: (v) => <span style={{ textTransform: 'capitalize' }}>{v}</span> },
    { title: 'Type', dataIndex: 'appointmentType', key: 'appointmentType',
      render: (v) => <span style={{ textTransform: 'capitalize' }}>{v}</span> },
    { title: 'Date', dataIndex: 'appointmentDate', key: 'date',
      render: (v) => dayjs(v).format('DD MMM YYYY') },
    { title: 'Time', key: 'time',
      render: (_, r) => `${r.startTime} – ${r.endTime}` },
    { title: 'Customer', dataIndex: 'userId', key: 'userId' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s] ?? 'default'}>{s.toUpperCase()}</Tag> },
    { title: 'Specialist', dataIndex: 'specialistName', key: 'specialist',
      render: (v) => v ?? <span style={{ color: '#aaa' }}>Unassigned</span> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/appointments/${record.appointmentId}`)}>
            View
          </Button>
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              onClick={() => setAssignModal({ open: true, appointmentId: record.appointmentId })}
            >
              Assign Specialist
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Appointments</h2>

      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 140 }}
          onChange={(v) => setFilters((f) => ({ ...f, status: v ?? '' }))}
        >
          {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <Option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Option>
          ))}
        </Select>

        <Select
          placeholder="Category"
          allowClear
          style={{ width: 140 }}
          onChange={(v) => setFilters((f) => ({ ...f, category: v ?? '' }))}
        >
          {['tiles', 'kitchen', 'wardrobe', 'flooring', 'lighting'].map((c) => (
            <Option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</Option>
          ))}
        </Select>

        <RangePicker
          onChange={(dates) => setFilters((f) => ({ ...f, dateRange: dates ?? [] }))}
        />

        <Button onClick={loadAppointments}>Refresh</Button>
      </Space>

      <Table
        rowKey="appointmentId"
        columns={columns}
        dataSource={appointments}
        loading={loading}
        pagination={{ pageSize: 20 }}
        onRow={(record) => ({
          style: { cursor: 'pointer' },
        })}
      />

      {/* Assign Specialist Modal */}
      <Modal
        title="Assign Specialist"
        open={assignModal.open}
        onOk={handleAssignSave}
        onCancel={() => setAssignModal({ open: false, appointmentId: null })}
        okText="Assign"
      >
        <Select
          placeholder="Select a specialist"
          style={{ width: '100%' }}
          onChange={setAssignSpecialistId}
        >
          {specialists.map((sp) => (
            <Option key={sp.specialistId} value={sp.specialistId}>{sp.name}</Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
