from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai_service import ai_service

router = APIRouter(prefix="/api/warnings", tags=["风险预警"])

@router.post("/analyze", response_model=schemas.WarningResponse)
async def analyze_warning(warning: schemas.WarningCreate, db: Session = Depends(get_db)):
    """分析可疑信息风险"""
    # 调用AI分析
    result = await ai_service.analyze_risk(warning.content)
    
    # 保存到数据库
    db_warning = models.Warning(
        content=warning.content,
        risk_level=result["risk_level"],
        analysis_result=result["analysis_result"],
        suggestion=result["suggestion"]
    )
    db.add(db_warning)
    db.commit()
    db.refresh(db_warning)
    
    return db_warning

@router.get("/", response_model=list[schemas.WarningResponse])
def get_warnings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取预警记录列表"""
    warnings = db.query(models.Warning).order_by(
        models.Warning.created_at.desc()
    ).offset(skip).limit(limit).all()
    return warnings

@router.get("/{warning_id}", response_model=schemas.WarningResponse)
def get_warning(warning_id: int, db: Session = Depends(get_db)):
    """获取预警详情"""
    warning = db.query(models.Warning).filter(models.Warning.id == warning_id).first()
    if not warning:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="预警记录不存在")
    return warning
