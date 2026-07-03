import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Input, Modal, message, Empty, Typography, Divider } from 'antd';
import { BookOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { articleApi } from '../services/api';

const { Search } = Input;
const { Title, Paragraph } = Typography;

const Education = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', article_type: '' });

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.article_type) params.article_type = filters.article_type;
      
      const response = await articleApi.getList(params);
      setArticles(response.data);
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showArticleDetail = async (id) => {
    try {
      const response = await articleApi.getById(id);
      setSelectedArticle(response.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取文章详情失败');
    }
  };

  const articleTypes = ['防范指南', '案例分析', '安全知识', '法律法规'];

  const getTypeColor = (type) => {
    const colorMap = {
      '防范指南': 'blue',
      '案例分析': 'orange',
      '安全知识': 'green',
      '法律法规': 'purple',
    };
    return colorMap[type] || 'default';
  };

  return (
    <div>
      <Card title="科普中心" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索文章标题或内容"
            allowClear
            onSearch={(value) => setFilters({ ...filters, keyword: value })}
            style={{ width: 300, marginRight: 16 }}
            prefix={<SearchOutlined />}
          />
          <span style={{ marginRight: 8 }}>分类筛选：</span>
          {articleTypes.map(type => (
            <Tag
              key={type}
              color={filters.article_type === type ? 'blue' : 'default'}
              style={{ cursor: 'pointer', marginBottom: 8 }}
              onClick={() => setFilters({ 
                ...filters, 
                article_type: filters.article_type === type ? '' : type 
              })}
            >
              {type}
            </Tag>
          ))}
        </div>
      </Card>

      {articles.length === 0 && !loading ? (
        <Card>
          <Empty description="暂无文章" />
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={articles}
          loading={loading}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => showArticleDetail(item.id)}
                style={{ height: '100%' }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag color={getTypeColor(item.article_type)}>{item.article_type}</Tag>
                  <span style={{ color: '#999', fontSize: 12, float: 'right' }}>
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {item.view_count}
                  </span>
                </div>
                <Title level={5} style={{ marginBottom: 8 }}>{item.title}</Title>
                <Paragraph 
                  ellipsis={{ rows: 3 }}
                  style={{ color: '#666', marginBottom: 8 }}
                >
                  {item.content.replace(/[#*`]/g, '').substring(0, 150)}
                </Paragraph>
                <div style={{ color: '#999', fontSize: 12 }}>
                  {item.author} | {new Date(item.created_at).toLocaleDateString()}
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={selectedArticle?.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedArticle && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color={getTypeColor(selectedArticle.article_type)}>
                {selectedArticle.article_type}
              </Tag>
              <span style={{ color: '#999', marginLeft: 16 }}>
                {selectedArticle.author} | 
                <EyeOutlined style={{ margin: '0 4px' }} />
                {selectedArticle.view_count} | 
                {new Date(selectedArticle.created_at).toLocaleDateString()}
              </span>
            </div>
            <Divider />
            <div 
              style={{ 
                lineHeight: 2, 
                whiteSpace: 'pre-wrap',
                fontSize: 15
              }}
              dangerouslySetInnerHTML={{ 
                __html: selectedArticle.content
                  .replace(/\n/g, '<br/>')
                  .replace(/## (.*)/g, '<h3 style="color:#1890ff;margin:16px 0 8px">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/- (.*)/g, '• $1<br/>')
              }} 
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Education;
