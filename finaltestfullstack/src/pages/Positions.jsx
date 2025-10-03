import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Drawer,
  Form,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { api } from "../api";

const { Option } = Select;

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const json = await api.getPositions();
      setPositions(json.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách vị trí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await api.createPosition({
        code: values.code,
        name: values.name,
        description: values.description, // khớp BE
        isActive: values.isActive === "active",
      });
      message.success("Tạo vị trí thành công!");
      setOpen(false);
      form.resetFields();
      fetchData();
    } catch (e) {
      console.error(e);
      message.error("Không thể tạo vị trí công tác");
    }
  };

  const handleDelete = async (_id) => {
    try {
      setLoading(true);
      await api.deletePosition(_id);
      message.success("Đã xóa vị trí");
      fetchData();
    } catch (e) {
      console.error(e);
      message.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    { title: "Mã", dataIndex: "code", key: "code", width: 120 },
    { title: "Tên", dataIndex: "name", key: "name", width: 220 },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 140,
      render: (val) =>
        val ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" icon={<EyeOutlined />}>
            Chi tiết
          </Button>

          <Popconfirm
            title="Xóa vị trí"
            description={`Bạn chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filtered = positions.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.code?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Danh sách vị trí làm việc (công tác) của giáo viên</h2>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm mã, tên, mô tả..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Tạo mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Tổng: ${total}`,
        }}
      />

      <Drawer
        title="Tạo vị trí công tác"
        width={480}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleCreate}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã" }]}
          >
            <Input placeholder="Nhập mã vị trí" />
          </Form.Item>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên vị trí" />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả vị trí" />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="isActive"
            initialValue="active"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
