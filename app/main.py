from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import AsyncSessionLocal


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT 1"))
        result.scalar_one()

    return {
        "status": "healthy",
        "database": "connected",
    }