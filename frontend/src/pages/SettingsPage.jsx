import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Switch,
  Typography,
  Tag,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { aiProvidersAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

function SettingsPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await aiProvidersAPI.getAll();
      setProviders(response.data);
    } catch (error) {
      message.error('Failed to load AI providers');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingProvider(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (provider) => {
    setEditingProvider(provider);
    form.setFieldsValue({
      name: provider.name,
      provider_type: provider.provider_type,
      model: provider.model,
      base_url: provider.base_url,
      is_verifier: provider.is_verifier,
      is_active: provider.is_active
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProvider) {
        // Don't send api_key if it's '***'
        const updateData = { ...values };
        if (updateData.api_key === '***') {
          delete updateData.api_key;
        }
        await aiProvidersAPI.update(editingProvider.id, updateData);
        message.success('AI provider updated successfully');
      } else {
        await aiProvidersAPI.create(values);
        message.success('AI provider added successfully');
      }
      setModalVisible(false);
      form.resetFields();
      loadProviders();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to save AI provider');
    }
  };

  const handleDelete = async (id) => {
    try {
      await aiProvidersAPI.delete(id);
      message.success('AI provider deleted successfully');
      loadProviders();
    } catch (error) {
      message.error('Failed to delete AI provider');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await aiProvidersAPI.setActive(id, isActive);
      message.success(`Provider ${isActive ? 'activated' : 'deactivated'}`);
      loadProviders();
    } catch (error) {
      message.error('Failed to update provider status');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'provider_type',
      key: 'provider_type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Role',
      dataIndex: 'is_verifier',
      key: 'is_verifier',
      render: (isVerifier) => (
        <Tag color={isVerifier ? 'gold' : 'green'}>
          {isVerifier ? 'Verifier' : 'Provider'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this provider?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>AI Providers Configuration</Title>
              <Text type="secondary">
                Configure AI providers to use for verification. At least one provider should be set as "Verifier"
                to analyze and compare responses.
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Add Provider
            </Button>
          </div>

          <Table
            dataSource={providers}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Space>
      </Card>

      <Modal
        title={editingProvider ? 'Edit AI Provider' : 'Add AI Provider'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            provider_type: 'openai',
            is_verifier: false,
            is_active: true
          }}
        >
          <Form.Item
            name="name"
            label="Provider Name"
            rules={[{ required: true, message: 'Please enter provider name' }]}
          >
            <Input placeholder="e.g., My OpenAI Provider" />
          </Form.Item>

          <Form.Item
            name="provider_type"
            label="Provider Type"
            rules={[{ required: true, message: 'Please select provider type' }]}
          >
            <Select>
              <Option value="openai">OpenAI</Option>
              <Option value="anthropic">Anthropic (Claude)</Option>
              <Option value="custom">Custom API</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API Key"
            rules={[
              { required: !editingProvider, message: 'Please enter API key' }
            ]}
          >
            <Input.Password
              placeholder={editingProvider ? "Leave blank to keep current key" : "Enter API key"}
            />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            tooltip="Specify the model to use (e.g., gpt-4, gpt-3.5-turbo, claude-3-sonnet-20240229)"
          >
            <Input placeholder="e.g., gpt-4" />
          </Form.Item>

          <Form.Item
            name="base_url"
            label="Base URL (Optional)"
            tooltip="Custom API endpoint URL. Leave blank for default."
          >
            <Input placeholder="e.g., https://api.openai.com/v1" />
          </Form.Item>

          <Form.Item
            name="is_verifier"
            label="Use as Verifier"
            valuePropName="checked"
            tooltip="The verifier AI analyzes all responses and determines the best one"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProvider ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SettingsPage;
