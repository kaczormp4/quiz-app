from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import get_cors_origins, settings
from app.core.database import AsyncSessionLocal
from app.quizzes.routes import router as quizzes_router
from app.users.routes import router as auth_router


app = FastAPI(title=settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Quiz API is running"}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "env": settings.app_env,
    }


@app.get("/health/db")
async def health_db():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT 1"))
        value = result.scalar_one()

    return {
        "status": "ok",
        "database": value,
    }


app.include_router(quizzes_router)
app.include_router(auth_router)
