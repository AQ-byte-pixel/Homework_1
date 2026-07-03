import React, { useState, useEffect } from 'react';
import {
  Card, Input, Button, Steps, Tag, Space, Alert, List, Typography,
  Spin, message, Row, Col, Statistic, Divider, Collapse, Empty
} from 'antd';
import {
  ThunderboltOutlined, SearchOutlined, WarningOutlined,
  FileTextOutlined, CheckCircleOutlined, SafetyOutlined,
  HistoryOutlined, EyeOutlined, RocketOutlined, ApiOutlined
} from '@ant-design/icons';
import { agentApi } from '../services/api';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Agent = () => {
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await agentApi.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('获取历史失败', error);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      message.warning('请输入需要分析的可疑信息');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setCurrentStep(0);

    // 模拟步骤推进（实际是一次性返回，用定时器模拟进度效果）
    const stepTimers = [];
    for (let i = 0; i < 6; i++) {
      stepTimers.push(setTimeout(() => setCurrentStep(i), (i + 1) * 500));
    }

    try {
      const response = await agentApi.analyze(content);
      // 清除剩余定时器
      stepTimers.forEach(clearTimeout);
      setCurrentStep(6); // 全部完成
      setResult(response.data);
      fetchHistory();
    } catch (error) {
      stepTimers.forEach(clearTimeout);
      message.error('分析失败，请稍后重试');
      setCurrentStep(-1);
    } finally {
      setAnalyzing(false);
    }
  };

  const viewReport = async (id) => {
    try {
      const response = await agentApi.getReport(id);
      setResult(response.data);
      setCurrentStep(6);
    } catch (error) {
      message.error('获取报告失败');
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

  const stepItems = [
    { title: '识别类型', icon: <SearchOutlined /> },
    { title: '案例检索', icon: <FileTextOutlined /> },
    { title: '风险评估', icon: <WarningOutlined /> },
    { title: '扣子工作流', icon: <ApiOutlined /> },
    { title: '科普推荐', icon: <SafetyOutlined /> },
    { title: '报告生成', icon: <CheckCircleOutlined /> },
  ];

  const exampleInputs = [
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
            <ThunderboltOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            反诈分析智能体
          </span>
        }
      >
        <Alert
          message="智能体分析链"
          description="输入可疑信息后，AI智能体将自动执行：识别诈骗类型 → 检索案例库 → 风险评估 → 扣子工作流深度分析 → 推荐科普文章 → 生成分析报告"
          type="info"
          showIcon
          icon={<RocketOutlined />}
          style={{ marginBottom: 16 }}
        />

        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请粘贴您收到的可疑短信、电话内容或链接..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: 12 }}
          disabled={analyzing}
        />

        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleAnalyze}
            loading={analyzing}
            size="large"
          >
            开始分析
          </Button>
          <span style={{ color: '#999' }}>试试：</span>
          {exampleInputs.map((text, idx) => (
            <Tag
              key={idx}
              color="blue"
              style={{ cursor: analyzing ? 'not-allowed' : 'pointer' }}
              onClick={() => !analyzing && setContent(text)}
            >
              示例{idx + 1}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* 分析进度 */}
      {(analyzing || currentStep >= 0) && (
        <Card style={{ marginTop: 16 }}>
          <Steps
            current={currentStep}
            status={analyzing ? 'process' : currentStep >= 6 ? 'finish' : 'wait'}
            items={stepItems.map((item, idx) => ({
              title: item.title,
              icon: item.icon,
              status: idx < currentStep ? 'finish' : idx === currentStep && analyzing ? 'process' : undefined,
            }))}
          />
          {analyzing && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Spin tip={`正在${stepItems[currentStep]?.title || '分析'}...`} size="large" />
            </div>
          )}
        </Card>
      )}

      {/* 分析结果 */}
      {result && !analyzing && (
        <Card
          title={
            <span>
              <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              分析结果
            </span>
          }
          style={{ marginTop: 16 }}
        >
          {/* 概览统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Statistic title="诈骗类型" value={result.fraud_type} valueStyle={{ fontSize: 16, color: '#1890ff' }} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="风险等级"
                value={result.risk_level}
                valueStyle={{ fontSize: 16, color: getRiskColor(result.risk_level) }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="风险评分"
                value={result.steps?.[2]?.result?.risk_score || '--'}
                suffix="/100"
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="紧急程度"
                value={result.steps?.[2]?.result?.urgency || '--'}
                valueStyle={{ fontSize: 16, color: '#faad14' }}
              />
            </Col>
          </Row>

          <Collapse defaultActiveKey={['risk', 'cases', 'coze', 'articles', 'report']}>
            {/* Step 1: 诈骗类型 */}
            <Panel header="Step 1 - 诈骗类型识别" key="type">
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{result.fraud_type}</Tag>
              <Paragraph style={{ marginTop: 8, color: '#666' }}>
                {result.steps?.[0]?.result?.detail}
              </Paragraph>
            </Panel>

            {/* Step 2: 案例检索 */}
            <Panel header={`Step 2 - 案例检索（匹配 ${result.steps?.[1]?.result?.count || 0} 条）`} key="cases">
              {result.steps?.[1]?.result?.cases?.length > 0 ? (
                <List
                  dataSource={result.steps[1].result.cases}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<span><Tag color="orange">{item.case_type}</Tag>{item.title}</span>}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="未找到相似案例" />
              )}
            </Panel>

            {/* Step 3: 风险评估 */}
            <Panel header="Step 3 - 风险评估" key="risk">
              <Alert
                message={`风险等级：${result.risk_level}`}
                description={result.steps?.[2]?.result?.analysis}
                type={result.risk_level === '高' ? 'error' : result.risk_level === '中' ? 'warning' : 'success'}
                showIcon
                style={{ marginBottom: 12 }}
              />
              {result.steps?.[2]?.result?.key_indicators?.length > 0 && (
                <div>
                  <Text strong>关键风险指标：</Text>
                  <div style={{ marginTop: 8 }}>
                    {result.steps[2].result.key_indicators.map((ind, idx) => (
                      <Tag key={idx} color="red" style={{ marginBottom: 4 }}>{ind}</Tag>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Text strong>处理建议：</Text>
                <Paragraph style={{ marginTop: 4 }}>{result.steps?.[2]?.result?.suggestion}</Paragraph>
              </div>
            </Panel>

            {/* Step 4: 扣子工作流 */}
            <Panel header="Step 4 - 扣子工作流深度分析" key="coze">
              {result.steps?.[3]?.result?.status === 'success' ? (
                <div>
                  <Alert
                    message="扣子工作流分析完成"
                    type="success"
                    showIcon
                    style={{ marginBottom: 12 }}
                  />
                  {result.steps[3].result.result && (
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                      {typeof result.steps[3].result.result === 'object' ? (
                        Object.entries(result.steps[3].result.result).map(([key, value]) => (
                          <div key={key} style={{ marginBottom: 4 }}>
                            <Text strong>{key}：</Text>
                            <Text>{String(value)}</Text>
                          </div>
                        ))
                      ) : (
                        <Text>{String(result.steps[3].result.result)}</Text>
                      )}
                    </div>
                  )}
                </div>
              ) : result.steps?.[3]?.result?.status === '未配置' ? (
                <Alert
                  message="扣子工作流未配置"
                  description="请在后端环境变量中设置 COZE_API_TOKEN 和 COZE_WORKFLOW_ID 以启用扣子工作流分析"
                  type="warning"
                  showIcon
                />
              ) : (
                <Alert
                  message={result.steps?.[3]?.result?.message || '扣子工作流未执行'}
                  type="info"
                  showIcon
                />
              )}
            </Panel>

            {/* Step 5: 科普推荐 */}
            <Panel header={`Step 5 - 科普推荐（${result.steps?.[4]?.result?.count || 0} 篇）`} key="articles">
              {result.steps?.[4]?.result?.articles?.length > 0 ? (
                <List
                  size="small"
                  dataSource={result.steps[4].result.articles}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="green">{item.article_type}</Tag>
                      <Text>{item.title}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>阅读 {item.view_count}</Text>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无推荐文章" />
              )}
            </Panel>

            {/* Step 6: 完整报告 */}
            <Panel header="Step 6 - 完整分析报告" key="report">
              <div
                style={{ lineHeight: 2, whiteSpace: 'pre-wrap', fontSize: 14, background: '#fafafa', padding: 16, borderRadius: 8 }}
                dangerouslySetInnerHTML={{
                  __html: (result.report || '')
                    .replace(/\n/g, '<br/>')
                    .replace(/# (.*)/g, '<h3 style="color:#1890ff;margin:8px 0">$1</h3>')
                    .replace(/## (.*)/g, '<h4 style="color:#333;margin:8px 0">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/---/g, '<hr/>')
                    .replace(/&gt; (.*)/g, '<blockquote style="color:#999;border-left:3px solid #1890ff;padding-left:8px">$1</blockquote>')
                }}
              />
            </Panel>
          </Collapse>
        </Card>
      )}

      {/* 分析历史 */}
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8 }} />
            分析历史
          </span>
        }
        style={{ marginTop: 16 }}
      >
        {history.length === 0 ? (
          <Empty description="暂无分析记录" />
        ) : (
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />} onClick={() => viewReport(item.id)}>
                    查看
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={getRiskColor(item.risk_level)}>{item.risk_level}风险</Tag>
                      <Tag color="blue">{item.fraud_type}</Tag>
                      <Text type="secondary">{item.content?.substring(0, 40)}...</Text>
                    </Space>
                  }
                  description={new Date(item.created_at).toLocaleString()}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Agent;
