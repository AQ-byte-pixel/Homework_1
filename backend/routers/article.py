from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/articles", tags=["科普文章"])

@router.get("/", response_model=list[schemas.ArticleResponse])
def get_articles(
    skip: int = 0,
    limit: int = 20,
    article_type: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取文章列表"""
    query = db.query(models.Article)
    
    if article_type:
        query = query.filter(models.Article.article_type == article_type)
    if keyword:
        query = query.filter(
            (models.Article.title.contains(keyword)) | 
            (models.Article.content.contains(keyword))
        )
    
    articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    return articles

@router.get("/{article_id}", response_model=schemas.ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """获取文章详情"""
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    
    # 增加浏览次数
    article.view_count += 1
    db.commit()
    db.refresh(article)
    
    return article

@router.post("/", response_model=schemas.ArticleResponse)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    """创建文章"""
    db_article = models.Article(**article.dict())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

@router.put("/{article_id}", response_model=schemas.ArticleResponse)
def update_article(article_id: int, article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    """更新文章"""
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="文章不存在")
    
    for key, value in article.dict().items():
        setattr(db_article, key, value)
    
    db.commit()
    db.refresh(db_article)
    return db_article

@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    """删除文章"""
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="文章不存在")
    
    db.delete(db_article)
    db.commit()
    return {"message": "文章已删除"}
