import React, { useState } from 'react';
import { Card, Input, Button, Alert, Tag, Spin, Result, Divider, message, List } from 'antd';
import { 
  WarningOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import { warningApi } from '../services/api';

const { TextArea } = Input;

const Warning = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      message.warning('请输入需要分析的信息内容');
      return;
    }

    setLoading(true);
    try {
      const response = await warningApi.analyze(content);
      setResult(response.data);
    } catch (error) {
      message.error('分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case '高': return '#ff4d4f';
      case '中': return '#faad14';
      case '低': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case '高': return <CloseCircleOutlined />;
      case '中': return <ExclamationCircleOutlined />;
      case '低': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  const getRiskStatus = (level) => {
    switch (level) {
      case '高': return 'error';
      case '中': return 'warning';
      case '低': return 'success';
      default: return 'info';
    }
  };

  const exampleMessages = [
    '恭喜您在XX活动中获得一等奖，奖金50000元，请点击链接 http://xxx.com 领取',
    '我是XX公安局的，你涉嫌一起洗钱案件，需要将资金转到安全账户配合调查',
    '高薪兼职，日赚300-500，只需手机操作，时间自由，有意者加微信xxx',
    '您的快递在运输途中丢失，我们将为您双倍赔偿，请添加客服微信处理',
  ];

  return (
    <div>
      <Card 
        title={
          <span>
            <WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />
            风险预警系统
          </span>
        }
      >
        <Alert
          message="使用说明"
          description="将您收到的可疑短信、电话内容、链接等信息粘贴到下方输入框，AI将为您分析风险等级并给出处理建议。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>可疑信息内容：</div>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请粘贴您收到的可疑短信、电话内容或链接..."
            autoSize={{ minRows: 4, maxRows: 8 }}
            style={{ marginBottom: 16 }}
          />

          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleAnalyze}
            loading={loading}
            size="large"
          >
            AI风险分析
          </Button>
        </div>

        <Divider>示例信息（点击快速填入）</Divider>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={exampleMessages}
          renderItem={(item) => (
            <List.Item>
              <Card 
                size="small" 
                hoverable
                onClick={() => setContent(item)}
                style={{ cursor: 'pointer' }}
              >
                {item.length > 50 ? item.substring(0, 50) + '...' : item}
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {loading && (
        <Card style={{ marginTop: 24, textAlign: 'center' }}>
          <Spin size="large" tip="AI正在分析中..." />
        </Card>
      )}

      {result && !loading && (
        <Card style={{ marginTop: 24 }}>
          <Result
            status={getRiskStatus(result.risk_level)}
            title={
              <span>
                风险等级：
                <Tag 
                  color={getRiskColor(result.risk_level)} 
                  style={{ fontSize: 16, padding: '4px 12px' }}
                  icon={getRiskIcon(result.risk_level)}
                >
                  {result.risk_level}风险
                </Tag>
              </span>
            }
            subTitle={new Date(result.created_at).toLocaleString()}
          />

          <Divider />

          <div style={{ marginBottom: 24 }}>
            <h3><SafetyOutlined style={{ marginRight: 8, color: '#1890ff' }} />分析结果</h3>
            <div style={{ 
              background: '#fafafa', 
              padding: 16, 
              borderRadius: 8,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8
            }}>
              {result.analysis_result}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3><CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />处理建议</h3>
            <Alert
              message={result.suggestion}
              type={getRiskStatus(result.risk_level)}
              showIcon
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>

          <Alert
            message="温馨提示"
            description="如遇可疑诈骗信息，请及时向学校保卫处报告或拨打110报警。保护个人信息，不轻信陌生来电来信。"
            type="info"
            showIcon
          />
        </Card>
      )}
    </div>
  );
};

export default Warning;
