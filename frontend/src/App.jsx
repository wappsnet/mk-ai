import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { MessageOutlined, SettingOutlined } from '@ant-design/icons';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '50px' }}>
            AI Verifier
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['chat']}
            items={[
              {
                key: 'chat',
                icon: <MessageOutlined />,
                label: <Link to="/">Chat</Link>,
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: <Link to="/settings">Settings</Link>,
              },
            ]}
          />
        </Header>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
