from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/admin", tags=["管理后台"])

@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """获取仪表盘统计数据"""
    # 总案例数
    total_cases = db.query(models.Case).count()
    
    # 总预警数
    total_warnings = db.query(models.Warning).count()
    
    # 高风险预警数
    high_risk_warnings = db.query(models.Warning).filter(
        models.Warning.risk_level == "高"
    ).count()
    
    # 总文章数
    total_articles = db.query(models.Article).count()
    
    # 最近案例
    recent_cases = db.query(models.Case).order_by(
        models.Case.created_at.desc()
    ).limit(5).all()
    
    # 案例类型分布
    case_types = db.query(
        models.Case.case_type,
        func.count(models.Case.id)
    ).group_by(models.Case.case_type).all()
    case_type_distribution = {case_type: count for case_type, count in case_types}
    
    # 预警趋势（最近7天）
    warning_trend = []
    for i in range(6, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        next_date = date + timedelta(days=1)
        count = db.query(models.Warning).filter(
            models.Warning.created_at >= date,
            models.Warning.created_at < next_date
        ).count()
        warning_trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return schemas.DashboardStats(
        total_cases=total_cases,
        total_warnings=total_warnings,
        high_risk_warnings=high_risk_warnings,
        total_articles=total_articles,
        recent_cases=recent_cases,
        case_type_distribution=case_type_distribution,
        warning_trend=warning_trend
    )

@router.get("/cases", response_model=list[schemas.CaseResponse])
def get_all_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有案例（管理用）"""
    cases = db.query(models.Case).order_by(
        models.Case.created_at.desc()
    ).offset(skip).limit(limit).all()
    return cases

@router.get("/warnings", response_model=list[schemas.WarningResponse])
def get_all_warnings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有预警记录（管理用）"""
    warnings = db.query(models.Warning).order_by(
        models.Warning.created_at.desc()
    ).offset(skip).limit(limit).all()
    return warnings

@router.get("/articles", response_model=list[schemas.ArticleResponse])
def get_all_articles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有文章（管理用）"""
    articles = db.query(models.Article).order_by(
        models.Article.created_at.desc()
    ).offset(skip).limit(limit).all()
    return articles
