from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import AsyncSessionLocal

from app.api.claim_api import router as claims_router
from app.api.provider_api import router as providers_router
from app.api.beneficiary_api import router as beneficiaries_router


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


app.include_router(claims_router)
app.include_router(providers_router)
app.include_router(beneficiaries_router)


@app.get("/health")
async def health_check():

    async with AsyncSessionLocal() as session:

        result = await session.execute(
            text("SELECT 1")
        )

        result.scalar_one()

    return {
        "status": "healthy",
        "database": "connected",
    }