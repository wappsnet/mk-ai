import { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  List,
  Button,
  Input,
  Space,
  Typography,
  Spin,
  message,
  Empty,
  Tag,
  Alert,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
  CloseCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { chatsAPI, aiProvidersAPI, Chat, AIProvider } from '../services/api';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Provider {
  id: number;
  name: string;
  provider_type: string;
  is_verifier: boolean;
}

interface Response {
  id: number;
  provider: Provider;
  status: 'success' | 'error';
  text?: string;
  error_message?: string;
  response_time: number;
}

interface Verification {
  summary: string;
  best_response_id?: number;
  reasoning?: string;
}

interface ChatMessage {
  id: number;
  content: string;
  responses: Response[];
  verification?: Verification;
}

function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await chatsAPI.getAll();
      setChats(response.data);
    } catch (error) {
      message.error('Failed to load chats');
    }
  };

  const loadProviders = async () => {
    try {
      const response = await aiProvidersAPI.getActive();
      setProviders(response.data);
    } catch (error) {
      message.error('Failed to load AI providers');
    }
  };

  const loadMessages = async (chatId: number) => {
    setLoading(true);
    try {
      const response = await chatsAPI.getMessages(chatId);
      setMessages(response.data as ChatMessage[]);
    } catch {
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const timestamp = new Date().toLocaleString();
      const response = await chatsAPI.create(`New Chat - ${timestamp}`);
      await loadChats();
      const newChat: Chat = {
        id: response.data.id,
        title: `New Chat - ${timestamp}`,
        user_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedChat(newChat);
    } catch {
      message.error('Failed to create chat');
    }
  };

  const deleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatsAPI.delete(chatId);
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      await loadChats();
      message.success('Chat deleted');
    } catch {
      message.error('Failed to delete chat');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      message.warning('Please enter a message');
      return;
    }

    if (!selectedChat) {
      message.warning('Please select or create a chat');
      return;
    }

    if (providers.filter(p => !p.is_verifier).length === 0) {
      message.error('No AI providers configured. Please configure providers in Settings.');
      return;
    }

    setSending(true);
    try {
      await chatsAPI.sendMessage(selectedChat.id, inputMessage);
      setInputMessage('');
      await loadMessages(selectedChat.id);
    } catch {
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderResponse = (response: Response) => {
    if (response.status === 'error') {
      return (
        <Alert
          message={`Error from ${response.provider.name}`}
          description={response.error_message || 'Unknown error'}
          type="error"
          icon={<CloseCircleOutlined />}
          showIcon
        />
      );
    }

    return (
      <Card
        size="small"
        title={
          <Space>
            <RobotOutlined />
            <Text strong>{response.provider.name}</Text>
            <Tag color="green">{response.response_time}ms</Tag>
          </Space>
        }
        style={{ marginBottom: 12 }}
      >
        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
          {response.text}
        </Paragraph>
      </Card>
    );
  };

  const renderVerification = (verification: Verification | undefined, responses: Response[]) => {
    if (!verification) return null;

    const bestResponse = responses.find(r => r.id === verification.best_response_id);

    return (
      <Card
        style={{ marginTop: 16, background: '#f0f9ff', borderColor: '#1890ff' }}
        title={
          <Space>
            <StarOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ color: '#1890ff' }}>Verification Summary</Text>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Summary:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {verification.summary}
            </Paragraph>
          </div>

          {bestResponse && (
            <div>
              <Text strong>Best Response: </Text>
              <Tag color="blue">{bestResponse.provider.name}</Tag>
            </div>
          )}

          {verification.reasoning && (
            <Collapse
              items={[
                {
                  key: '1',
                  label: 'Reasoning',
                  children: (
                    <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                      {verification.reasoning}
                    </Paragraph>
                  )
                }
              ]}
            />
          )}
        </Space>
      </Card>
    );
  };

  return (
    <Layout style={{ background: 'white', height: 'calc(100vh - 112px)' }}>
      <Sider width={300} style={{ background: '#fafafa', padding: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={createNewChat}
          block
          style={{ marginBottom: 16 }}
        >
          New Chat
        </Button>

        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => setSelectedChat(chat)}
              style={{
                cursor: 'pointer',
                background: selectedChat?.id === chat.id ? '#e6f7ff' : 'white',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '4px',
                border: selectedChat?.id === chat.id ? '1px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <List.Item.Meta
                title={<Text ellipsis>{chat.title}</Text>}
                description={new Date(chat.created_at).toLocaleDateString()}
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => deleteChat(chat.id, e)}
              />
            </List.Item>
          )}
        />
      </Sider>

      <Content style={{ padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <Title level={4} style={{ marginBottom: 16 }}>
              {selectedChat.title}
            </Title>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: 16,
                padding: '16px',
                background: '#fafafa',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="No messages yet. Start chatting!" />
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: 24 }}>
                    <Card
                      style={{ marginBottom: 16 }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Space>
                        <UserOutlined />
                        <Text strong>You:</Text>
                      </Space>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Paragraph>
                    </Card>

                    {msg.responses.length > 0 && (
                      <div style={{ paddingLeft: 24 }}>
                        <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                          AI Responses ({msg.responses.length}):
                        </Text>
                        {msg.responses.map((response) => (
                          <div key={response.id}>
                            {renderResponse(response)}
                          </div>
                        ))}

                        {renderVerification(msg.verification, msg.responses)}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  sendMessage();
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={sending}
                style={{ height: 'auto' }}
              >
                Send
              </Button>
            </Space.Compact>
          </>
        ) : (
          <Empty
            description="Select a chat or create a new one to start"
            style={{ marginTop: '20%' }}
          />
        )}
      </Content>
    </Layout>
  );
}

export default ChatPage;
