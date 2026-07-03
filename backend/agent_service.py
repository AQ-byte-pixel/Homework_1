import httpx
import os
import json
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-3539466d16314b7e95a2cf3f6361e8c9")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# 扣子编程(Coze Coding)配置
COZE_API_TOKEN = os.getenv("COZE_API_TOKEN", "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhmNmQ5ZGJkLWI1ZDEtNGJmZi04ZmY1LWRjMTE3ZjNhMjU4YyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIlowNVkwckFrMmtTSWRDSFl2QmZHRzdJVHRERmwxV3FTIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzgzMTIwMzkwLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjU4NDM5NDYxNzg4NzEyOTk1Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjU4NDQzNzYxMjczMjc0NDA5In0.VQtrYW0IiduecrFEs5toCva-H7Zqm8NwCRYfe8f7Azk7zqmECzBoRZLRyDwv6-O5M1LqnlnQQa8P80mOWstjbPmcWJdJEI2KS2fSLkJlIKlHFhU3Jd_VbJjVdkweWyps4oiFXkH370XLo9UTBp9tgFQ63688s5paYnO2iNLRbZ8uTu8GuGGxyjTnqB1rnVmEc2_mXknU1vuUBqdl2sP-9EbWtM6R62aUMvmvyQNy_RIMOR44pkUWmCuSQOffgnQ2uELo9zpUe5kaSCEmhBmywDjG4nsKvLPoEm_iLv9K86TcRbV-PNtSCdmRkFtbfR0OifbX57PYTLLeFhSo90aeg")
COZE_WORKFLOW_ID = os.getenv("COZE_WORKFLOW_ID", "Z05Y0rAk2kSIdCHYvBfGG7ItDDFfl1WqQ")
COZE_API_URL = "https://api.coze.cn/v1/workflow/run"


async def _call_deepseek(system_prompt: str, user_content: str) -> str:
    """调用DeepSeek API的通用方法"""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "max_tokens": 2000,
        "temperature": 0.3
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL, headers=headers, json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"DeepSeek API调用失败: {e}")
        return ""


class AntiFraudAgent:
    """反诈分析智能体 - 多步骤信息分析链"""

    async def analyze(self, content: str, db: Session) -> dict:
        """执行完整的分析链"""
        steps = []

        # Step 1: AI 识别诈骗类型
        fraud_type, fraud_detail = await self._classify_fraud(content)
        steps.append({
            "step": 1,
            "name": "识别诈骗类型",
            "status": "completed",
            "result": {"fraud_type": fraud_type, "detail": fraud_detail}
        })

        # Step 2: 从案例库检索相似案例
        similar_cases = self._search_cases(db, fraud_type, content)
        steps.append({
            "step": 2,
            "name": "案例库检索",
            "status": "completed",
            "result": {
                "count": len(similar_cases),
                "cases": similar_cases
            }
        })

        # Step 3: AI 风险评估
        risk_report = await self._assess_risk(content, fraud_type, similar_cases)
        steps.append({
            "step": 3,
            "name": "风险评估",
            "status": "completed",
            "result": risk_report
        })

        # Step 4: 扣子工作流深度分析
        coze_result = await self._call_coze_workflow(content, fraud_type, risk_report)
        steps.append({
            "step": 4,
            "name": "扣子工作流分析",
            "status": "completed",
            "result": coze_result
        })

        # Step 5: 推荐科普文章
        articles = self._recommend_articles(db, fraud_type)
        steps.append({
            "step": 5,
            "name": "科普推荐",
            "status": "completed",
            "result": {"count": len(articles), "articles": articles}
        })

        # Step 6: 生成完整分析报告
        report = await self._generate_report(content, fraud_type, fraud_detail, risk_report, similar_cases, articles, coze_result)
        steps.append({
            "step": 6,
            "name": "报告生成",
            "status": "completed",
            "result": {"report": report}
        })

        return {
            "content": content,
            "fraud_type": fraud_type,
            "risk_level": risk_report.get("risk_level", "中"),
            "steps": steps,
            "report": report,
            "created_at": datetime.utcnow().isoformat()
        }

    async def _classify_fraud(self, content: str) -> tuple:
        """Step 1: AI识别诈骗类型"""
        system_prompt = """你是一个诈骗信息分类专家。请分析以下信息，判断其属于哪种诈骗类型。

只能从以下类型中选择一个：
- 冒充身份（冒充老师、领导、客服等）
- 兼职刷单（高薪兼职、刷单返利等）
- 冒充公检法（涉嫌犯罪、安全账户等）
- 网络贷款（低息贷款、先交费后放款等）
- 虚假购物（退款赔偿、虚假链接等）
- 中奖诈骗（中奖通知、领取奖金等）
- 其他

请严格按以下JSON格式输出，不要输出其他内容：
{"type": "诈骗类型", "confidence": "高/中/低", "reason": "分类理由（一句话）"}"""

        response = await _call_deepseek(system_prompt, content)
        
        try:
            # 尝试解析JSON
            json_str = response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            
            result = json.loads(json_str)
            fraud_type = result.get("type", "其他")
            detail = f"置信度：{result.get('confidence', '中')}，原因：{result.get('reason', '')}"
            return fraud_type, detail
        except Exception:
            # 如果解析失败，尝试从文本中提取
            fraud_types = ["冒充身份", "兼职刷单", "冒充公检法", "网络贷款", "虚假购物", "中奖诈骗"]
            for ft in fraud_types:
                if ft in response:
                    return ft, f"AI分析结果：{response[:100]}"
            return "其他", f"AI分析结果：{response[:100]}"

    def _search_cases(self, db: Session, fraud_type: str, content: str) -> list:
        """Step 2: 从案例库检索相似案例"""
        from models import Case
        
        # 先按类型匹配
        cases = db.query(Case).filter(Case.case_type == fraud_type).order_by(Case.created_at.desc()).limit(3).all()
        
        # 如果类型匹配不到，尝试关键词匹配
        if not cases:
            keywords = content.split()
            for keyword in keywords[:5]:
                if len(keyword) > 1:
                    cases = db.query(Case).filter(
                        (Case.title.contains(keyword)) | 
                        (Case.description.contains(keyword))
                    ).limit(3).all()
                    if cases:
                        break
        
        # 如果还是没匹配到，返回最新的3个案例
        if not cases:
            cases = db.query(Case).order_by(Case.created_at.desc()).limit(3).all()
        
        return [
            {
                "id": c.id,
                "title": c.title,
                "case_type": c.case_type,
                "description": c.description,
                "prevention": c.prevention or ""
            }
            for c in cases
        ]

    async def _assess_risk(self, content: str, fraud_type: str, similar_cases: list) -> dict:
        """Step 3: AI风险评估"""
        cases_context = ""
        if similar_cases:
            cases_context = "\n\n参考相似案例：\n"
            for i, c in enumerate(similar_cases[:2], 1):
                cases_context += f"案例{i}：{c['title']} - {c['description']}\n"

        system_prompt = f"""你是一个反诈风险评估专家。请对以下可疑信息进行深度风险分析。

诈骗类型分类：{fraud_type}
{cases_context}

请严格按以下JSON格式输出，不要输出其他内容：
{{
    "risk_level": "高/中/低",
    "risk_score": 85,
    "analysis": "详细的风险分析（2-3句话）",
    "key_indicators": ["风险指标1", "风险指标2", "风险指标3"],
    "suggestion": "处理建议（2-3句话）",
    "urgency": "立即处理/尽快处理/注意防范"
}}"""

        response = await _call_deepseek(system_prompt, content)
        
        try:
            json_str = response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            
            result = json.loads(json_str)
            return {
                "risk_level": result.get("risk_level", "中"),
                "risk_score": result.get("risk_score", 50),
                "analysis": result.get("analysis", ""),
                "key_indicators": result.get("key_indicators", []),
                "suggestion": result.get("suggestion", ""),
                "urgency": result.get("urgency", "注意防范")
            }
        except Exception:
            risk_level = "中"
            if "高风险" in response or "风险等级：高" in response:
                risk_level = "高"
            elif "低风险" in response or "风险等级：低" in response:
                risk_level = "低"
            
            return {
                "risk_level": risk_level,
                "risk_score": 70 if risk_level == "高" else 50 if risk_level == "中" else 30,
                "analysis": response[:200],
                "key_indicators": [],
                "suggestion": "请保持警惕，不要轻信陌生信息。",
                "urgency": "注意防范"
            }

    def _recommend_articles(self, db: Session, fraud_type: str) -> list:
        """Step 4: 推荐科普文章"""
        from models import Article
        
        # 按诈骗类型关键词匹配文章
        articles = db.query(Article).filter(
            (Article.content.contains(fraud_type)) |
            (Article.title.contains(fraud_type)) |
            (Article.article_type == "防范指南")
        ).order_by(Article.view_count.desc()).limit(3).all()
        
        # 如果没匹配到，返回热门防范指南
        if not articles:
            articles = db.query(Article).filter(
                Article.article_type.in_(["防范指南", "安全知识"])
            ).order_by(Article.view_count.desc()).limit(3).all()
        
        # 如果还是没有，返回任意3篇
        if not articles:
            articles = db.query(Article).order_by(Article.view_count.desc()).limit(3).all()
        
        return [
            {
                "id": a.id,
                "title": a.title,
                "article_type": a.article_type,
                "view_count": a.view_count
            }
            for a in articles
        ]

    async def _call_coze_workflow(self, content: str, fraud_type: str, risk_report: dict) -> dict:
        """Step 4: 调用扣子编程(Coze Coding)工作流进行深度分析"""
        if not COZE_API_TOKEN or not COZE_WORKFLOW_ID:
            return {
                "status": "未配置",
                "message": "扣子工作流未配置，请在环境变量中设置 COZE_API_TOKEN 和 COZE_WORKFLOW_ID",
                "result": None
            }
        
        try:
            headers = {
                "Authorization": f"Bearer {COZE_API_TOKEN}",
                "Content-Type": "application/json"
            }
            data = {
                "workflow_id": COZE_WORKFLOW_ID,
                "parameters": {
                    "input": content,
                    "fraud_type": fraud_type,
                    "risk_level": risk_report.get("risk_level", "中"),
                    "risk_analysis": risk_report.get("analysis", "")
                }
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    COZE_API_URL, headers=headers, json=data
                )
                print(f"扣子工作流响应状态: {response.status_code}")
                response.raise_for_status()
                result = response.json()
                print(f"扣子工作流返回: {result}")
                
                # 解析扣子工作流返回结果
                # 扣子编程可能返回多种格式，依次尝试解析
                coze_data = None
                
                # 格式1: {"data": "..."}
                if "data" in result:
                    coze_data = result["data"]
                # 格式2: {"output": "..."}
                elif "output" in result:
                    coze_data = result["output"]
                # 格式3: 直接是结果对象
                elif "msg" not in result and "error" not in result:
                    coze_data = result
                
                if coze_data is None:
                    return {
                        "status": "failed",
                        "message": f"扣子工作流返回格式异常: {result.get('msg', '未知错误')}",
                        "result": None
                    }
                
                # 尝试解析为JSON
                try:
                    if isinstance(coze_data, str):
                        # 去除可能的markdown代码块包裹
                        json_str = coze_data.strip()
                        if json_str.startswith("```"):
                            json_str = json_str.split("```")[1]
                            if json_str.startswith("json"):
                                json_str = json_str[4:]
                            json_str = json_str.strip()
                        parsed = json.loads(json_str)
                    elif isinstance(coze_data, dict):
                        parsed = coze_data
                    else:
                        parsed = {"analysis": str(coze_data)}
                    
                    return {
                        "status": "success",
                        "message": "扣子工作流分析完成",
                        "result": parsed
                    }
                except (json.JSONDecodeError, IndexError):
                    return {
                        "status": "success",
                        "message": "扣子工作流分析完成",
                        "result": {"analysis": str(coze_data)}
                    }
        except httpx.HTTPStatusError as e:
            print(f"扣子工作流HTTP错误: {e.response.status_code} - {e.response.text}")
            return {
                "status": "failed",
                "message": f"扣子工作流调用失败(HTTP {e.response.status_code})",
                "result": None
            }
        except Exception as e:
            print(f"扣子工作流调用失败: {e}")
            return {
                "status": "failed",
                "message": f"扣子工作流调用失败: {str(e)}",
                "result": None
            }

    async def _generate_report(self, content, fraud_type, fraud_detail, risk_report, similar_cases, articles, coze_result=None) -> str:
        """Step 6: 生成完整分析报告"""
        cases_text = ""
        if similar_cases:
            cases_text = "\n\n【相似案例】\n"
            for i, c in enumerate(similar_cases, 1):
                cases_text += f"{i}. {c['title']}（{c['case_type']}）\n"
                if c.get('prevention'):
                    cases_text += f"   防范要点：{c['prevention'][:80]}...\n"

        articles_text = ""
        if articles:
            articles_text = "\n\n【推荐阅读】\n"
            for i, a in enumerate(articles, 1):
                articles_text += f"{i}. {a['title']}\n"

        # 扣子工作流分析结果
        coze_text = ""
        if coze_result and coze_result.get("status") == "success" and coze_result.get("result"):
            coze_data = coze_result["result"]
            coze_text = "\n\n【扣子工作流深度分析】\n"
            if isinstance(coze_data, dict):
                for key, value in coze_data.items():
                    coze_text += f"- {key}：{value}\n"
            else:
                coze_text += f"{coze_data}\n"
        elif coze_result and coze_result.get("status") == "未配置":
            coze_text = "\n\n【扣子工作流】未配置\n"

        report = f"""# 反诈分析报告

**分析时间**：{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}

---

## 一、信息概述

**原始信息**：{content}

## 二、诈骗类型识别

**判定类型**：{fraud_type}
**分析详情**：{fraud_detail}

## 三、风险评估

**风险等级**：{risk_report.get('risk_level', '中')}
**风险评分**：{risk_report.get('risk_score', 50)}/100
**紧急程度**：{risk_report.get('urgency', '注意防范')}

**风险分析**：
{risk_report.get('analysis', '')}

**关键风险指标**：
{chr(10).join(f'- {ind}' for ind in risk_report.get('key_indicators', [])) if risk_report.get('key_indicators') else '- 暂无关键指标'}

**处理建议**：
{risk_report.get('suggestion', '请保持警惕，不要轻信陌生信息。')}
{coze_text}{cases_text}{articles_text}
---

> 本报告由反诈AI智能体自动生成，仅供参考。如有疑问请咨询学校保卫处或拨打110。"""

        return report


# 全局智能体实例
agent = AntiFraudAgent()
