import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Tag, message, Popconfirm,
} from 'antd';

const { Option } = Select;

const BASE_URL = 'https://api.aparna.hashtechy.space/api/';
const CATEGORIES = ['tiles', 'kitchen', 'wardrobe', 'flooring', 'lighting'];

async function apiFetch(endpoint, options = {}) {
  const token = document.cookie.match(/userToken=([^;]+)/)?.[1] ?? '';
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...options,
  });
  return res.json();
}

export default function SpecialistList() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('Specialist/All');
      setSpecialists(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    form.resetFields();
    setModal({ open: true, editing: null });
  };

  const openEdit = (record) => {
    form.setFieldsValue({
      ...record,
      categories: record.categories?.split(',').map((c) => c.trim()),
    });
    setModal({ open: true, editing: record });
  };

  const handleSave = async (values) => {
    const payload = {
      ...values,
      categories: Array.isArray(values.categories)
        ? values.categories.join(',')
        : values.categories,
    };
    if (modal.editing) {
      await apiFetch(`Specialist/${modal.editing.specialistId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...payload, specialistId: modal.editing.specialistId }),
      });
      message.success('Specialist updated.');
    } else {
      await apiFetch('Specialist', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      message.success('Specialist created.');
    }
    setModal({ open: false, editing: null });
    load();
  };

  const handleToggleActive = async (record) => {
    await apiFetch(`Specialist/${record.specialistId}/toggle-active`, { method: 'PUT' });
    message.success(`Specialist ${record.isActive ? 'deactivated' : 'activated'}.`);
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'specialistId', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phoneNo', key: 'phone' },
    {
      title: 'Categories', dataIndex: 'categories', key: 'categories',
      render: (v) =>
        v?.split(',').map((c) => (
          <Tag key={c.trim()} color="blue" style={{ textTransform: 'capitalize' }}>
            {c.trim()}
          </Tag>
        )),
    },
    {
      title: 'Active', dataIndex: 'isActive', key: 'isActive',
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title={`${record.isActive ? 'Deactivate' : 'Activate'} this specialist?`}
            onConfirm={() => handleToggleActive(record)}
          >
            <Button size="small" danger={record.isActive}>
              {record.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Specialists</h2>
        <Button type="primary" onClick={openCreate}>+ Add Specialist</Button>
      </Space>

      <Table
        rowKey="specialistId"
        columns={columns}
        dataSource={specialists}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={modal.editing ? 'Edit Specialist' : 'Add Specialist'}
        open={modal.open}
        onOk={() => form.submit()}
        onCancel={() => setModal({ open: false, editing: null })}
        okText="Save"
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNo" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categories" label="Categories" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select categories">
              {CATEGORIES.map((c) => (
                <Option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
