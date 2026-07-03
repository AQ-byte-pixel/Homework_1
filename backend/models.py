from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from database import Base

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    case_type = Column(String(50), nullable=False)  # 诈骗类型
    description = Column(Text, nullable=False)
    process = Column(Text)  # 案例经过
    analysis = Column(Text)  # 套路分析
    prevention = Column(Text)  # 防范要点
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Warning(Base):
    __tablename__ = "warnings"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)  # 可疑信息内容
    risk_level = Column(String(20))  # 风险等级：低/中/高
    analysis_result = Column(Text)  # AI分析结果
    suggestion = Column(Text)  # 处理建议
    created_at = Column(DateTime, default=datetime.utcnow)

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    article_type = Column(String(50))  # 文章类型
    author = Column(String(100))
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
