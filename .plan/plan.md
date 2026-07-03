# 反诈分析智能体 + 信息分析链工作流

## Context

当前系统的 AI 能力是简单的单轮问答（ai_service.py），缺乏多步骤自动化分析能力。用户需要一个"反诈分析智能体"，当用户输入可疑信息后，智能体自动执行完整的分析链：识别诈骗类型 → 检索案例库 → 风险评估 → 生成报告 → 推荐科普文章，并将结果以可视化流程展示给用户。

## 实现方案

### Task 1: 新建智能体服务模块

**新建文件**: `backend/agent_service.py`

创建 `AntiFraudAgent` 类，实现多步骤分析链：

```
class AntiFraudAgent:
    async def analyze(self, content: str) -> dict:
        # Step 1: AI 识别诈骗类型（分类）
        fraud_type = await self._classify_fraud(content)
        
        # Step 2: 从案例库检索相似案例
        similar_cases = await self._search_cases(fraud_type, content)
        
        # Step 3: AI 风险评估（结合案例上下文）
        risk_report = await self._assess_risk(content, fraud_type, similar_cases)
        
        # Step 4: 推荐科普文章
        articles = await self._recommend_articles(fraud_type)
        
        # Step 5: 生成完整分析报告
        report = self._generate_report(content, fraud_type, risk_report, similar_cases, articles)
        
        return report
```

每个步骤独立调用 DeepSeek API，使用不同的 system prompt：
- `_classify_fraud`: 让 AI 输出诈骗类型（冒充身份/兼职刷单/冒充公检法/网络贷款/虚假购物/其他）
- `_search_cases`: 用 SQLAlchemy 查询数据库匹配案例
- `_assess_risk`: 结合案例上下文让 AI 做深度风险分析
- `_recommend_articles`: 根据诈骗类型查询相关文章
- `_generate_report`: 汇总所有步骤结果生成结构化报告

### Task 2: 新增智能体 API 接口

**新建文件**: `backend/routers/agent.py`
**修改文件**: `backend/main.py`（注册路由）

```
POST /api/agent/analyze  — 提交可疑信息，触发智能体分析链
GET  /api/agent/history  — 获取智能体分析历史
GET  /api/agent/report/{id} — 获取分析报告详情
```

**新建文件**: `backend/models.py` 中新增 `AgentAnalysis` 模型：
- id, content, fraud_type, risk_level, report（完整报告JSON）, created_at

### Task 3: 前端智能体页面

**新建文件**: `frontend/src/pages/Agent.jsx`

页面设计：
- 顶部输入区：TextArea 输入可疑信息 + "开始分析"按钮
- 中间流程展示区：用 Steps 组件（Ant Design）展示分析链的每个步骤
  - Step 1: 识别诈骗类型（显示分类结果 + 置信度）
  - Step 2: 案例检索（显示匹配到的相似案例卡片）
  - Step 3: 风险评估（显示风险等级 + 详细分析）
  - Step 4: 科普推荐（显示推荐文章列表）
  - Step 5: 报告生成（显示完整分析报告）
- 每个步骤完成后打勾，实时展示进度
- 底部：分析历史记录列表

### Task 4: 路由和菜单注册

**修改文件**: 
- `frontend/src/App.jsx` — 添加 `/agent` 路由
- `frontend/src/components/AppLayout.jsx` — 侧边栏添加"智能体分析"菜单（使用 `ThunderboltOutlined` 图标，放在"风险预警"之后）

## 关键文件清单

| 操作 | 文件路径 |
|------|---------|
| 新建 | `backend/agent_service.py` |
| 新建 | `backend/routers/agent.py` |
| 修改 | `backend/models.py`（新增 AgentAnalysis 模型） |
| 修改 | `backend/main.py`（注册路由） |
| 新建 | `frontend/src/pages/Agent.jsx` |
| 修改 | `frontend/src/App.jsx`（添加路由） |
| 修改 | `frontend/src/components/AppLayout.jsx`（添加菜单） |
| 修改 | `frontend/src/services/api.js`（添加 agent API） |

## 验证方式

1. 重启后端服务，确认新 API 可用
2. 访问 `/agent` 页面，输入一条可疑信息（如"恭喜您中奖了，请点击链接领取"）
3. 观察分析链每个步骤依次执行并展示结果
4. 确认最终报告包含：诈骗类型、风险等级、相似案例、防范建议、推荐文章
5. 检查分析历史记录是否正常保存和展示
