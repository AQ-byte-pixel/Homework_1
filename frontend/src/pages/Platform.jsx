import React, { useState, useRef, useEffect } from 'react';
import { Card, Tabs, Spin, Button, Result, Row, Col, Alert, Space, Tag } from 'antd';
import { 
  LinkOutlined, 
  PhoneOutlined, 
  FileSearchOutlined, 
  WarningOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const Platform = () => {
  const [activePlatform, setActivePlatform] = useState('gjfzzx');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const platforms = {
    gjfzzx: {
      name: '国家反诈中心',
      url: 'https://www.gjfzzx.cn/',
      icon: <SafetyCertificateOutlined />,
      description: '国家反诈中心是公安部打击治理电信网络新型违法犯罪工作的官方平台，提供诈骗举报、风险查询、反诈宣传等功能。',
      features: ['诈骗举报', '风险查询', '反诈宣传', '身份核实'],
    },
    '12321': {
      name: '12321举报平台',
      url: 'https://www.12321.cn/',
      icon: <WarningOutlined />,
      description: '12321网络不良与垃圾信息举报受理中心，由中国互联网协会设立，受理垃圾短信、诈骗电话、不良APP等举报。',
      features: ['垃圾短信举报', '诈骗电话举报', '不良APP举报', '网络诈骗举报'],
    },
    cybhp: {
      name: '中央网信办举报平台',
      url: 'https://www.12377.cn/',
      icon: <GlobalOutlined />,
      description: '中央网信办（国家互联网信息办公室）违法和不良信息举报中心，受理各类互联网违法和不良信息举报。',
      features: ['有害信息举报', '诈骗信息举报', '网络谣言举报', '侵权信息举报'],
    },
  };

  const currentPlatform = platforms[activePlatform];

  useEffect(() => {
    setLoading(true);
    setLoadFailed(false);
    
    // 设置超时检测
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoadFailed(true);
        setLoading(false);
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activePlatform]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
    setLoadFailed(false);
  };

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
    setLoadFailed(true);
  };

  const handleReload = () => {
    setLoading(true);
    setLoadFailed(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentPlatform.url;
    }
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoadFailed(true);
        setLoading(false);
      }
    }, 8000);
  };

  const handleTabChange = (key) => {
    setActivePlatform(key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Card style={{ marginBottom: 16 }}>
        <Tabs activeKey={activePlatform} onChange={handleTabChange}>
          {Object.entries(platforms).map(([key, platform]) => (
            <TabPane 
              tab={
                <span>
                  {platform.icon}
                  {platform.name}
                </span>
              } 
              key={key} 
            />
          ))}
        </Tabs>
        
        <Alert
          message={currentPlatform.description}
          type="info"
          showIcon
          icon={currentPlatform.icon}
          style={{ marginTop: 8 }}
        />

        <div style={{ marginTop: 12 }}>
          <Space>
            <span style={{ color: '#666' }}>平台功能：</span>
            {currentPlatform.features.map((feature, index) => (
              <Tag key={index} color="blue">{feature}</Tag>
            ))}
          </Space>
        </div>
      </Card>

      <Card 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReload}
              size="small"
            >
              刷新
            </Button>
            <Button 
              type="primary"
              icon={<ExportOutlined />} 
              onClick={() => window.open(currentPlatform.url, '_blank')}
              size="small"
            >
              新窗口打开
            </Button>
          </Space>
        }
      >
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <Spin size="large" tip="正在加载平台..." />
          </div>
        )}

        {loadFailed ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Result
              status="warning"
              title="页面无法嵌入"
              subTitle="目标平台可能限制了iframe嵌入，请点击下方按钮在新窗口中打开。"
              extra={
                <Space>
                  <Button type="primary" onClick={handleReload}>
                    重试
                  </Button>
                  <Button 
                    type="primary"
                    onClick={() => window.open(currentPlatform.url, '_blank')}
                  >
                    新窗口打开{currentPlatform.name}
                  </Button>
                </Space>
              }
            />
            <Card style={{ marginTop: 24, textAlign: 'left', maxWidth: 600, margin: '24px auto' }}>
              <h4>{currentPlatform.name}简介</h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>{currentPlatform.description}</p>
              <p style={{ marginTop: 12 }}>
                <strong>官方网址：</strong>
                <a href={currentPlatform.url} target="_blank" rel="noopener noreferrer">
                  {currentPlatform.url}
                </a>
              </p>
            </Card>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentPlatform.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: 500,
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={currentPlatform.name}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" hoverable>
            <div style={{ textAlign: 'center' }}>
              <PhoneOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold' }}>反诈热线</div>
              <div style={{ color: '#666', fontSize: 14 }}>96110</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" hoverable>
            <div style={{ textAlign: 'center' }}>
              <FileSearchOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold' }}>举报诈骗</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                <a href="https://www.gjfzzx.cn/" target="_blank" rel="noopener noreferrer">
                  在线举报
                </a>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" hoverable>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold' }}>紧急报警</div>
              <div style={{ color: '#666', fontSize: 14 }}>110</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Platform;
