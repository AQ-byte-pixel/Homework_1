from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

from database import get_db
from models import AgentAnalysis
from agent_service import agent

router = APIRouter(prefix="/api/agent", tags=["智能体分析"])


class AgentAnalyzeRequest(BaseModel):
    content: str


class AgentAnalyzeResponse(BaseModel):
    id: int
    content: str
    fraud_type: str
    risk_level: str
    steps: list
    report: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("/analyze")
async def analyze_content(request: AgentAnalyzeRequest, db: Session = Depends(get_db)):
    """提交可疑信息，触发智能体分析链"""
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="请输入需要分析的内容")

    # 执行智能体分析链
    result = await agent.analyze(request.content, db)

    # 保存到数据库
    db_analysis = AgentAnalysis(
        content=request.content,
        fraud_type=result["fraud_type"],
        risk_level=result["risk_level"],
        report=result["report"],
        steps=json.dumps(result["steps"], ensure_ascii=False),
        created_at=datetime.utcnow()
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return {
        "id": db_analysis.id,
        "content": result["content"],
        "fraud_type": result["fraud_type"],
        "risk_level": result["risk_level"],
        "steps": result["steps"],
        "report": result["report"],
        "created_at": result["created_at"]
    }


@router.get("/history")
def get_analysis_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取智能体分析历史"""
    analyses = db.query(AgentAnalysis).order_by(
        AgentAnalysis.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [
        {
            "id": a.id,
            "content": a.content,
            "fraud_type": a.fraud_type,
            "risk_level": a.risk_level,
            "created_at": a.created_at.isoformat() if a.created_at else ""
        }
        for a in analyses
    ]


@router.get("/report/{analysis_id}")
def get_analysis_report(analysis_id: int, db: Session = Depends(get_db)):
    """获取分析报告详情"""
    analysis = db.query(AgentAnalysis).filter(AgentAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="分析报告不存在")

    steps = []
    try:
        steps = json.loads(analysis.steps) if analysis.steps else []
    except Exception:
        steps = []

    return {
        "id": analysis.id,
        "content": analysis.content,
        "fraud_type": analysis.fraud_type,
        "risk_level": analysis.risk_level,
        "steps": steps,
        "report": analysis.report,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else ""
    }
