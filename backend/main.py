from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import cases, warning, chat, article, admin, agent
import models

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="校园反诈智能科普预警AI智能体系统",
    description="校园反诈智能科普预警AI智能体系统API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(cases.router)
app.include_router(warning.router)
app.include_router(chat.router)
app.include_router(article.router)
app.include_router(admin.router)
app.include_router(agent.router)

@app.get("/")
def root():
    return {
        "message": "校园反诈智能科普预警AI智能体系统API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "服务运行正常"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
