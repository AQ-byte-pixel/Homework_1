from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from database import get_db
import models, schemas
from ai_service import ai_service

router = APIRouter(prefix="/api/chat", tags=["AI问答"])

@router.post("/ask", response_model=schemas.ChatResponse)
async def ask_question(chat: schemas.ChatRequest, db: Session = Depends(get_db)):
    """AI智能问答"""
    session_id = chat.session_id or str(uuid.uuid4())
    
    # 调用AI获取回答
    answer = await ai_service.chat(chat.question)
    
    # 保存到历史记录
    db_chat = models.ChatHistory(
        session_id=session_id,
        question=chat.question,
        answer=answer
    )
    db.add(db_chat)
    db.commit()
    
    return schemas.ChatResponse(answer=answer, session_id=session_id)

@router.get("/history", response_model=list[schemas.ChatHistoryResponse])
def get_chat_history(
    session_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """获取对话历史"""
    query = db.query(models.ChatHistory)
    if session_id:
        query = query.filter(models.ChatHistory.session_id == session_id)
    
    history = query.order_by(
        models.ChatHistory.created_at.desc()
    ).offset(skip).limit(limit).all()
    return history
