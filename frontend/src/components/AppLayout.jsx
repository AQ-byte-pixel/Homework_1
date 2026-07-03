import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  RobotOutlined, 
  AlertOutlined, 
  BookOutlined, 
  SettingOutlined,
  SafetyOutlined,
  LinkOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首页仪表盘',
    },
    {
      key: '/cases',
      icon: <FileTextOutlined />,
      label: '诈骗案例库',
    },
    {
      key: '/chat',
      icon: <RobotOutlined />,
      label: 'AI智能问答',
    },
    {
      key: '/warning',
      icon: <AlertOutlined />,
      label: '风险预警',
    },
    {
      key: '/agent',
      icon: <ThunderboltOutlined />,
      label: '智能体分析',
    },
    {
      key: '/education',
      icon: <BookOutlined />,
      label: '科普中心',
    },
    {
      key: '/platform',
      icon: <LinkOutlined />,
      label: '联动平台',
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: '管理后台',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <SafetyOutlined style={{ fontSize: 24, marginRight: collapsed ? 0 : 10 }} />
          {!collapsed && '校园反诈系统'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            校园反诈智能科普预警AI智能体系统
          </div>
          <div style={{ color: '#666' }}>
            守护校园安全，防范网络诈骗
          </div>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <div style={{
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: '100%',
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
