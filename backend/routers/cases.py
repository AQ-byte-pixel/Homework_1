from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/cases", tags=["案例管理"])

@router.get("/", response_model=list[schemas.CaseResponse])
def get_cases(
    skip: int = 0,
    limit: int = 20,
    case_type: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取案例列表"""
    query = db.query(models.Case)
    
    if case_type:
        query = query.filter(models.Case.case_type == case_type)
    if keyword:
        query = query.filter(
            (models.Case.title.contains(keyword)) | 
            (models.Case.description.contains(keyword))
        )
    
    cases = query.order_by(models.Case.created_at.desc()).offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=schemas.CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    """获取案例详情"""
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="案例不存在")
    return case

@router.post("/", response_model=schemas.CaseResponse)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    """创建案例"""
    db_case = models.Case(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.put("/{case_id}", response_model=schemas.CaseResponse)
def update_case(case_id: int, case: schemas.CaseCreate, db: Session = Depends(get_db)):
    """更新案例"""
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案例不存在")
    
    for key, value in case.dict().items():
        setattr(db_case, key, value)
    
    db.commit()
    db.refresh(db_case)
    return db_case

@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    """删除案例"""
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案例不存在")
    
    db.delete(db_case)
    db.commit()
    return {"message": "案例已删除"}
