import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

const { Header, Content } = Layout;

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Don't show header on login/register pages
  const showHeader = !['/login', '/register'].includes(location.pathname);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {showHeader && isAuthenticated && (
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
              }}
            >
              <img
                src="/logo-icon.svg"
                alt="AI Verifier"
                style={{ width: '32px', height: '32px', marginRight: '12px' }}
              />
              <div
                style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
              >
                AI Verifier
              </div>
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[
                location.pathname === '/settings' ? 'settings' : 'chat',
              ]}
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
          </div>

          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span>{user.name}</span>
              </div>
            </Dropdown>
          )}
        </Header>
      )}

      <Content style={{ padding: showHeader ? '24px' : '0' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
