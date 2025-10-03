import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Teachers from "./pages/Teachers";
import Positions from "./pages/Positions";
import { Layout, Menu } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

import "antd/dist/reset.css";
import "./styles.css";

const { Header, Sider, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider theme="light" width={220}>
          <div className="logo">Teacher Manager</div>
          <Menu mode="inline" defaultSelectedKeys={["teachers"]}>
            <Menu.Item key="stat" icon={<BarChartOutlined />}>
              <Link to="/">Thống kê</Link>
            </Menu.Item>
            <Menu.Item key="class" icon={<UserOutlined />}>
              <Link to="/">Lớp học</Link>
            </Menu.Item>
            <Menu.Item key="student" icon={<UserOutlined />}>
              <Link to="/">Học sinh</Link>
            </Menu.Item>
            <Menu.Item key="teachers" icon={<TeamOutlined />}>
              <Link to="/teachers">Giáo viên</Link>
            </Menu.Item>
            <Menu.Item key="data" icon={<DatabaseOutlined />}>
              <Link to="/">Dữ liệu</Link>
            </Menu.Item>
            <Menu.Item key="positions" icon={<DatabaseOutlined />}>
              <Link to="/positions">Vị trí công tác</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Content */}
        <Layout>
          <Header style={{ background: "#fff", padding: 0 }} />
          <Content style={{ margin: "16px", background: "#fff", padding: 20 }}>
            <Routes>
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/" element={<h1>Trang Thống kê</h1>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
