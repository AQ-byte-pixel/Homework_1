import httpx
import os
from typing import Optional

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-3539466d16314b7e95a2cf3f6361e8c9")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

class AIService:
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.api_url = DEEPSEEK_API_URL
    
    async def chat(self, question: str, context: Optional[str] = None) -> str:
        """AI智能问答"""
        system_prompt = """你是一个专业的校园反诈AI助手。你的职责是：
1. 帮助用户识别各类诈骗手段
2. 提供防范诈骗的建议和指导
3. 分析可疑信息的风险等级
4. 普及反诈知识，提高防范意识

请用专业、友好的语气回答用户的问题。如果涉及具体诈骗案例，请结合案例进行分析。"""
        
        if context:
            system_prompt += f"\n\n参考信息：{context}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            "max_tokens": 1500,
            "temperature": 0.7
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=data
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            # 如果API调用失败，返回默认回答
            print(f"AI API调用失败: {e}")
            return self._get_fallback_answer(question)
    
    async def analyze_risk(self, content: str) -> dict:
        """分析风险等级"""
        prompt = f"""请分析以下信息的诈骗风险等级，并给出处理建议。

信息内容：{content}

请按以下格式回答：
1. 风险等级：（低/中/高）
2. 风险分析：（详细分析为什么是这个风险等级）
3. 处理建议：（具体的应对措施）
4. 警示信息：（相关的反诈提醒）"""
        
        response = await self.chat(prompt)
        
        # 解析风险等级
        risk_level = "中"
        if "高风险" in response or "风险等级：高" in response:
            risk_level = "高"
        elif "低风险" in response or "风险等级：低" in response:
            risk_level = "低"
        
        return {
            "risk_level": risk_level,
            "analysis_result": response,
            "suggestion": self._extract_suggestion(response)
        }
    
    def _extract_suggestion(self, text: str) -> str:
        """从AI回答中提取建议部分"""
        if "处理建议：" in text:
            start = text.find("处理建议：") + 5
            end = text.find("警示信息：") if "警示信息：" in text else len(text)
            return text[start:end].strip()
        return "请保持警惕，不要轻信陌生信息，如有疑问可咨询学校保卫处或拨打110。"
    
    def _get_fallback_answer(self, question: str) -> str:
        """默认回答（当API不可用时）"""
        if "中奖" in question or "奖金" in question:
            return "【高风险警示】这很可能是诈骗！\n\n常见中奖诈骗特征：\n1. 要求先缴纳手续费、税费\n2. 通过短信、电话等非官方渠道通知\n3. 要求提供个人信息或银行卡号\n\n建议：\n1. 不要回复该信息\n2. 不要点击任何链接\n3. 不要提供任何个人信息\n4. 可向学校保卫处或公安机关咨询"
        
        elif "转账" in question or "汇款" in question:
            return "【风险提示】转账前请务必确认：\n\n1. 对方身份是否真实可靠\n2. 转账原因是否合理\n3. 是否通过官方渠道核实\n\n常见诈骗套路：\n- 冒充老师/领导要求转账\n- 冒充公检法要求转账到'安全账户'\n- 虚假兼职要求先交押金\n\n建议：如有疑问，请立即停止操作，向学校保卫处或110咨询。"
        
        else:
            return "感谢您的提问！作为反诈AI助手，我建议您：\n\n1. 保持警惕：对陌生信息保持警觉\n2. 核实身份：涉及转账、个人信息时务必核实对方身份\n3. 不轻信：不轻信中奖、返利等诱惑信息\n4. 及时咨询：遇到可疑情况及时向学校保卫处或公安机关咨询\n\n如需更具体的建议，请详细描述您遇到的情况。"

# 全局AI服务实例
ai_service = AIService()
