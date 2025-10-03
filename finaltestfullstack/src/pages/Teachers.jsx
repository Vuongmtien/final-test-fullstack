// src/pages/Teachers.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Space,
  Avatar,
  message,
  Dropdown,
  Drawer,
  Form,
  Select,
  Switch,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
  DownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function parseList(res) {
  const root = res?.data ?? res;
  const data = root?.data ?? [];
  return {
    rows: Array.isArray(data) ? data : [],
    total: Number(root?.total ?? 0) || 0,
    page: Number(root?.page ?? 1) || 1,
    limit: Number(root?.limit ?? 20) || 20,
  };
}

export default function Teachers() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");

  // Drawer state
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Positions for Select
  const [positions, setPositions] = useState([]);
  const [loadingPos, setLoadingPos] = useState(false);

  async function fetchData(p = page, l = limit, s = search) {
    setLoading(true);
    try {
      const params = { page: p, limit: l };
      if (s.trim()) params.search = s.trim();

      const res = await axios.get(`${API}/teachers`, { params });
      const { rows, total, page, limit } = parseList(res);
      setRows(rows);
      setTotal(total);
      setPage(page);
      setLimit(limit);
    } catch (e) {
      console.error("Fetch teachers failed", e);
      message.error("Không tải được danh sách giáo viên.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPositions() {
    setLoadingPos(true);
    try {
      const res = await axios.get(`${API}/positions`, { params: { limit: 0 } });
      const arr = res?.data?.data ?? res?.data ?? [];
      setPositions(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error("Fetch positions failed", e);
      message.error("Không tải được danh sách vị trí công tác.");
      setPositions([]);
    } finally {
      setLoadingPos(false);
    }
  }

  useEffect(() => {
    fetchData(1, limit, "");
    fetchPositions();
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "STT",
        width: 80,
        align: "center",
        render: (_v, _r, i) => (page - 1) * (limit || 1) + i + 1,
      },
      {
        title: "Mã",
        dataIndex: ["user", "code"],
        width: 140,
        render: (v, r) => v || r?.code || "-",
      },
      {
        title: "Giáo viên",
        dataIndex: "user",
        width: 320,
        render: (u, r) => {
          const username = u?.username ?? r?.username ?? "-";
          const email = u?.email ?? r?.email ?? "";
          const phone = u?.phone ?? r?.phone ?? "";
          return (
            <Space>
              <Avatar>{(username?.[0] || "?").toUpperCase()}</Avatar>
              <div>
                <div style={{ fontWeight: 600 }}>{username}</div>
                {email && <div style={{ color: "#888" }}>{email}</div>}
                {phone && <div style={{ color: "#888" }}>{phone}</div>}
              </div>
            </Space>
          );
        },
      },
      {
        title: "Trình độ (cao nhất)",
        dataIndex: "education",
        width: 260,
        render: (ed, r) => {
          const v = ed ?? r?.education;
          if (!v) return "-";
          return (
            <div>
              {v.degree && <div>Bậc: {v.degree}</div>}
              {v.major && <div>Chuyên ngành: {v.major}</div>}
            </div>
          );
        },
      },
      {
        title: "Vị trí công tác",
        dataIndex: "positions",
        width: 220,
        render: (list) =>
          Array.isArray(list) && list.length
            ? list.map((p) => (
                <div key={p._id || p.code || p.name}>
                  <b>{p.name || "-"}</b>
                  {p.code ? <span style={{ color: "#888" }}> ({p.code})</span> : null}
                </div>
              ))
            : "-",
      },
      {
        title: "Địa chỉ",
        dataIndex: ["user", "address"],
        width: 220,
        render: (v, r) => v || r?.address || "-",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: 140,
        render: (s) =>
          s === "ACTIVE" ? <Tag color="green">Đang công tác</Tag> : <Tag>Ngừng</Tag>,
      },
      {
        title: "Hành động",
        fixed: "right",
        width: 160,
        render: (_, record) => (
          <Space>
            <Button type="link" icon={<EyeOutlined />}>
              Chi tiết
            </Button>
            <Popconfirm
              title="Xoá giáo viên"
              description="Bạn chắc chắn muốn xoá giáo viên này?"
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Xoá
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [page, limit]
  );

  const pageSizeMenu = {
    items: [10, 20, 50, 100, 0].map((n) => ({
      key: String(n),
      label: n === 0 ? "Lấy hết" : `${n}/trang`,
    })),
    onClick: ({ key }) => {
      const n = Number(key);
      setLimit(n);
      fetchData(1, n, search);
    },
  };

  async function handleDelete(row) {
    try {
      await axios.delete(`${API}/teachers/${row?._id}`);
      message.success("Đã xoá giáo viên.");
      // reload giữ nguyên page hiện tại
      fetchData(page, limit, search);
    } catch (e) {
      console.error("Delete teacher failed", e);
      message.error("Xoá thất bại.");
    }
  }

  function openDrawer() {
    form.resetFields();
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
  }

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // payload gửi lên — điều chỉnh key nếu BE của mình khác
      const payload = {
        user: {
          username: values.username?.trim(),
          email: values.email?.trim(),
          phone: values.phone?.trim(),
          address: values.address?.trim(),
        },
        status: values.active ? "ACTIVE" : "INACTIVE",
        education: {
          degree: values.degree || "",
          major: values.major || "",
        },
        // BE có thể mong đợi mảng id hoặc mảng object; phổ biến nhất là id:
        positionIds: values.positionIds || [],
      };

      await axios.post(`${API}/teachers`, payload);
      message.success("Tạo mới giáo viên thành công.");
      closeDrawer();
      // refresh về trang 1 để thấy bản ghi mới nhất
      fetchData(1, limit, search);
    } catch (e) {
      if (e?.errorFields) return; // lỗi validate của Form
      console.error("Create teacher failed", e);
      message.error(
        e?.response?.data?.message || "Không tạo được giáo viên. Vui lòng kiểm tra dữ liệu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Danh sách giáo viên
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="Tìm tên, email, SDT, mã giáo viên…"
          style={{ width: 420 }}
          onSearch={(val) => {
            setSearch(val || "");
            fetchData(1, limit, val || "");
          }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(page, limit, search)}>
          Tải lại
        </Button>
        <Dropdown menu={pageSizeMenu}>
          <Button>
            Page size: {limit === 0 ? "TẤT CẢ" : limit} <DownOutlined />
          </Button>
        </Dropdown>
        <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
          Tạo mới
        </Button>
      </Space>

      <Table
        rowKey={(r) => r._id}
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          current: page,
          pageSize: limit === 0 ? rows.length || 1 : limit,
          total,
          showSizeChanger: false,
          hideOnSinglePage: limit === 0,
          onChange: (p) => fetchData(p, limit, search),
        }}
        scroll={{ x: 1150 }}
      />

      {/* Drawer tạo mới */}
      <Drawer
        title="Tạo mới giáo viên"
        open={open}
        onClose={closeDrawer}
        width={560}
        destroyOnClose
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={closeDrawer}>Huỷ</Button>
            <Button type="primary" loading={submitting} onClick={onSubmit}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ active: true, positionIds: [] }}
        >
          <Form.Item
            label="Họ và tên"
            name="username"
            rules={[{ required: true, message: "Nhập họ và tên" }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="vd@domain.com" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="09xxxxxxxx" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Địa chỉ nơi ở" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="active" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
          </Form.Item>

          <Form.Item label="Bậc học (degree)" name="degree">
            <Select
              allowClear
              placeholder="Chọn bậc học"
              options={[
                { value: "Cử nhân", label: "Cử nhân" },
                { value: "Thạc sĩ", label: "Thạc sĩ" },
                { value: "Tiến sĩ", label: "Tiến sĩ" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Chuyên ngành (major)" name="major">
            <Input placeholder="VD: Công Nghệ Thông Tin" />
          </Form.Item>

          <Form.Item label="Vị trí công tác" name="positionIds">
            <Select
              mode="multiple"
              loading={loadingPos}
              placeholder="Chọn vị trí công tác"
              optionFilterProp="label"
              options={(positions || []).map((p) => ({
                label: `${p.name}${p.code ? ` (${p.code})` : ""}`,
                value: p._id,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
