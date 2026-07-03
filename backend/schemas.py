from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Case schemas
class CaseBase(BaseModel):
    title: str
    case_type: str
    description: str
    process: Optional[str] = None
    analysis: Optional[str] = None
    prevention: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Warning schemas
class WarningCreate(BaseModel):
    content: str

class WarningResponse(BaseModel):
    id: int
    content: str
    risk_level: str
    analysis_result: str
    suggestion: str
    created_at: datetime

    class Config:
        from_attributes = True

# Article schemas
class ArticleBase(BaseModel):
    title: str
    content: str
    article_type: Optional[str] = None
    author: Optional[str] = None

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    view_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Chat schemas
class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    session_id: str

class ChatHistoryResponse(BaseModel):
    id: int
    session_id: str
    question: str
    answer: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_cases: int
    total_warnings: int
    high_risk_warnings: int
    total_articles: int
    recent_cases: List[CaseResponse]
    case_type_distribution: dict
    warning_trend: List[dict]
