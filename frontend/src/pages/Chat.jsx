import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Tag, Spin, message, Empty } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ClearOutlined } from '@ant-design/icons';
import { chatApi } from '../services/api';

const { TextArea } = Input;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await chatApi.getHistory();
      if (response.data.length > 0) {
        const historyMessages = [];
        response.data.forEach(item => {
          historyMessages.push({ type: 'user', content: item.question, time: item.created_at });
          historyMessages.push({ type: 'ai', content: item.answer, time: item.created_at });
        });
        setMessages(historyMessages);
        setSessionId(response.data[0].session_id);
      }
    } catch (error) {
      console.error('加载历史记录失败', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入问题');
      return;
    }

    const question = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, { type: 'user', content: question, time: new Date().toISOString() }]);
    setLoading(true);

    try {
      const response = await chatApi.ask(question, sessionId);
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { type: 'ai', content: response.data.answer, time: new Date().toISOString() }]);
    } catch (error) {
      message.error('AI回答失败，请稍后重试');
      setMessages(prev => [...prev, { type: 'ai', content: '抱歉，AI暂时无法回答，请稍后重试。', time: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSessionId(null);
    message.success('对话已清空');
  };

  const quickQuestions = [
    '收到中奖短信怎么办？',
    '有人要我转账怎么办？',
    '如何识别刷单诈骗？',
    '个人信息泄露了怎么办？',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <RobotOutlined style={{ marginRight: 8 }} />
              AI反诈助手
            </span>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClear}
              size="small"
            >
              清空对话
            </Button>
          </div>
        }
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        bodyStyle={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {messages.length === 0 ? (
            <Empty 
              description="开始与AI反诈助手对话吧！"
              style={{ marginTop: 100 }}
            >
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8, color: '#666' }}>常见问题：</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {quickQuestions.map((q, index) => (
                    <Tag 
                      key={index} 
                      color="blue" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setInputValue(q)}
                    >
                      {q}
                    </Tag>
                  ))}
                </div>
              </div>
            </Empty>
          ) : (
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item 
                  style={{ 
                    border: 'none', 
                    padding: '8px 0',
                    justifyContent: item.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    flexDirection: item.type === 'user' ? 'row-reverse' : 'row',
                    maxWidth: '80%'
                  }}>
                    <Avatar 
                      icon={item.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{ 
                        backgroundColor: item.type === 'user' ? '#1890ff' : '#52c41a',
                        marginLeft: item.type === 'user' ? 0 : 8,
                        marginRight: item.type === 'user' ? 8 : 0,
                      }}
                    />
                    <div style={{
                      background: item.type === 'user' ? '#1890ff' : '#f0f0f0',
                      color: item.type === 'user' ? '#fff' : '#000',
                      padding: '10px 14px',
                      borderRadius: 8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {item.content}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin tip="AI正在思考..." />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题，例如：收到中奖短信怎么办？"
              autoSize={{ minRows: 2, maxRows: 4 }}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              style={{ height: 'auto' }}
            >
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
