import React, { useEffect, useState } from 'react';
import { 
  Card, Tabs, Table, Button, Modal, Form, Input, Select, Tag, 
  message, Popconfirm, Space, Descriptions, Alert
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, FileTextOutlined, AlertOutlined, BookOutlined
} from '@ant-design/icons';
import { caseApi, warningApi, articleApi } from '../services/api';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Admin = () => {
  const [activeTab, setActiveTab] = useState('cases');
  
  // Cases state
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseModalVisible, setCaseModalVisible] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [caseForm] = Form.useForm();

  // Warnings state
  const [warnings, setWarnings] = useState([]);
  const [warningsLoading, setWarningsLoading] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  // Articles state
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm] = Form.useForm();

  useEffect(() => {
    fetchCases();
    fetchWarnings();
    fetchArticles();
  }, []);

  // Cases functions
  const fetchCases = async () => {
    setCasesLoading(true);
    try {
      const response = await caseApi.getList({ limit: 100 });
      setCases(response.data);
    } catch (error) {
      message.error('获取案例列表失败');
    } finally {
      setCasesLoading(false);
    }
  };

  const handleAddCase = () => {
    setEditingCase(null);
    caseForm.resetFields();
    setCaseModalVisible(true);
  };

  const handleEditCase = (record) => {
    setEditingCase(record);
    caseForm.setFieldsValue(record);
    setCaseModalVisible(true);
  };

  const handleDeleteCase = async (id) => {
    try {
      await caseApi.delete(id);
      message.success('案例已删除');
      fetchCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSaveCase = async () => {
    try {
      const values = await caseForm.validateFields();
      if (editingCase) {
        await caseApi.update(editingCase.id, values);
        message.success('案例已更新');
      } else {
        await caseApi.create(values);
        message.success('案例已创建');
      }
      setCaseModalVisible(false);
      fetchCases();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // Warnings functions
  const fetchWarnings = async () => {
    setWarningsLoading(true);
    try {
      const response = await warningApi.getList({ limit: 100 });
      setWarnings(response.data);
    } catch (error) {
      message.error('获取预警记录失败');
    } finally {
      setWarningsLoading(false);
    }
  };

  const showWarningDetail = (record) => {
    setSelectedWarning(record);
    setWarningModalVisible(true);
  };

  // Articles functions
  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const response = await articleApi.getList({ limit: 100 });
      setArticles(response.data);
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleAddArticle = () => {
    setEditingArticle(null);
    articleForm.resetFields();
    setArticleModalVisible(true);
  };

  const handleEditArticle = (record) => {
    setEditingArticle(record);
    articleForm.setFieldsValue(record);
    setArticleModalVisible(true);
  };

  const handleDeleteArticle = async (id) => {
    try {
      await articleApi.delete(id);
      message.success('文章已删除');
      fetchArticles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSaveArticle = async () => {
    try {
      const values = await articleForm.validateFields();
      if (editingArticle) {
        await articleApi.update(editingArticle.id, values);
        message.success('文章已更新');
      } else {
        await articleApi.create(values);
        message.success('文章已创建');
      }
      setArticleModalVisible(false);
      fetchArticles();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const caseColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'case_type', key: 'case_type', width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '时间', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (text) => new Date(text).toLocaleDateString()
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCase(record)}>编辑</Button>
          <Popconfirm title="确定删除此案例？" onConfirm={() => handleDeleteCase(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const warningColumns = [
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '风险等级', dataIndex: 'risk_level', key: 'risk_level', width: 100,
      render: (level) => {
        const colorMap = { '高': 'red', '中': 'orange', '低': 'green' };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      }
    },
    {
      title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160,
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showWarningDetail(record)}>详情</Button>
      ),
    },
  ];

  const articleColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'article_type', key: 'article_type', width: 120,
      render: (type) => <Tag color="green">{type}</Tag>
    },
    { title: '作者', dataIndex: 'author', key: 'author', width: 100 },
    { title: '浏览', dataIndex: 'view_count', key: 'view_count', width: 80 },
    {
      title: '时间', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (text) => new Date(text).toLocaleDateString()
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditArticle(record)}>编辑</Button>
          <Popconfirm title="确定删除此文章？" onConfirm={() => handleDeleteArticle(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const caseTypes = ['冒充身份', '兼职刷单', '冒充公检法', '网络贷款', '虚假购物'];
  const articleTypes = ['防范指南', '案例分析', '安全知识', '法律法规'];

  return (
    <div>
      <Card title="管理后台">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><FileTextOutlined />案例管理</span>} 
            key="cases"
          >
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCase}>
                新增案例
              </Button>
            </div>
            <Table
              columns={caseColumns}
              dataSource={cases}
              rowKey="id"
              loading={casesLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane 
            tab={<span><AlertOutlined />预警记录</span>} 
            key="warnings"
          >
            <Alert
              message="预警记录由系统自动生成，不可手动添加"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={warningColumns}
              dataSource={warnings}
              rowKey="id"
              loading={warningsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane 
            tab={<span><BookOutlined />文章管理</span>} 
            key="articles"
          >
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddArticle}>
                新增文章
              </Button>
            </div>
            <Table
              columns={articleColumns}
              dataSource={articles}
              rowKey="id"
              loading={articlesLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Case Modal */}
      <Modal
        title={editingCase ? '编辑案例' : '新增案例'}
        open={caseModalVisible}
        onCancel={() => setCaseModalVisible(false)}
        onOk={handleSaveCase}
        width={700}
      >
        <Form form={caseForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入案例标题" />
          </Form.Item>
          <Form.Item name="case_type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择案例类型">
              {caseTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <TextArea rows={2} placeholder="请输入案例描述" />
          </Form.Item>
          <Form.Item name="process" label="案例经过">
            <TextArea rows={4} placeholder="请输入案例经过" />
          </Form.Item>
          <Form.Item name="analysis" label="套路分析">
            <TextArea rows={4} placeholder="请输入套路分析" />
          </Form.Item>
          <Form.Item name="prevention" label="防范要点">
            <TextArea rows={4} placeholder="请输入防范要点" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Warning Detail Modal */}
      <Modal
        title="预警详情"
        open={warningModalVisible}
        onCancel={() => setWarningModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedWarning && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="风险等级">
              <Tag color={
                selectedWarning.risk_level === '高' ? 'red' : 
                selectedWarning.risk_level === '中' ? 'orange' : 'green'
              }>
                {selectedWarning.risk_level}风险
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="可疑内容">{selectedWarning.content}</Descriptions.Item>
            <Descriptions.Item label="分析结果">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedWarning.analysis_result}</div>
            </Descriptions.Item>
            <Descriptions.Item label="处理建议">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedWarning.suggestion}</div>
            </Descriptions.Item>
            <Descriptions.Item label="时间">
              {new Date(selectedWarning.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Article Modal */}
      <Modal
        title={editingArticle ? '编辑文章' : '新增文章'}
        open={articleModalVisible}
        onCancel={() => setArticleModalVisible(false)}
        onOk={handleSaveArticle}
        width={700}
      >
        <Form form={articleForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item name="article_type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择文章类型">
              {articleTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={10} placeholder="请输入文章内容（支持Markdown格式）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
