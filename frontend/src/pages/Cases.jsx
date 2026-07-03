import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Select, Tag, Button, Modal, Descriptions, message, Space } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { caseApi } from '../services/api';

const { Search } = Input;
const { Option } = Select;

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    case_type: '',
  });

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.case_type) params.case_type = filters.case_type;
      
      const response = await caseApi.getList(params);
      setCases(response.data);
    } catch (error) {
      message.error('获取案例列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showCaseDetail = async (id) => {
    try {
      const response = await caseApi.getById(id);
      setSelectedCase(response.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取案例详情失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'case_type',
      key: 'case_type',
      width: 120,
      render: (type) => {
        const colorMap = {
          '冒充身份': 'orange',
          '兼职刷单': 'purple',
          '冒充公检法': 'red',
          '网络贷款': 'blue',
          '虚假购物': 'green',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => showCaseDetail(record.id)}
        >
          详情
        </Button>
      ),
    },
  ];

  const caseTypes = ['冒充身份', '兼职刷单', '冒充公检法', '网络贷款', '虚假购物'];

  return (
    <div>
      <Card title="诈骗案例库" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="搜索案例标题或描述"
            allowClear
            onSearch={(value) => setFilters({ ...filters, keyword: value })}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择诈骗类型"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setFilters({ ...filters, case_type: value || '' })}
          >
            {caseTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={cases}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={selectedCase?.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCase && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="标题">{selectedCase.title}</Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedCase.case_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="时间">
              {new Date(selectedCase.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {selectedCase.description}
            </Descriptions.Item>
            <Descriptions.Item label="案例经过">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedCase.process}</div>
            </Descriptions.Item>
            <Descriptions.Item label="套路分析">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedCase.analysis}</div>
            </Descriptions.Item>
            <Descriptions.Item label="防范要点">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedCase.prevention}</div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Cases;
