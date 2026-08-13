from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import ClaimType
from app.schema.claim_schema import (
    ClaimCreate,
    ClaimListResponse,
    ClaimResponse,
    ClaimUpdate,
)
from app.services.claim_service import ClaimService


router = APIRouter(
    prefix="/claims",
    tags=["Claims"],
)


@router.post(
    "",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_claim(
    data: ClaimCreate,
    db: AsyncSession = Depends(get_db),
):
    service = ClaimService(db)

    return await service.create_claim(data)


@router.get(
    "",
    response_model=ClaimListResponse,
)
async def get_claims(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    claim_type: ClaimType | None = None,
    provider_id: str | None = None,
    beneficiary_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
):
    service = ClaimService(db)

    return await service.get_claims(
        page=page,
        page_size=page_size,
        claim_type=claim_type,
        provider_id=provider_id,
        beneficiary_id=beneficiary_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/{claim_id}",
    response_model=ClaimResponse,
)
async def get_claim(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = ClaimService(db)

    return await service.get_claim(claim_id)


@router.patch(
    "/{claim_id}",
    response_model=ClaimResponse,
)
async def update_claim(
    claim_id: str,
    data: ClaimUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = ClaimService(db)

    return await service.update_claim(
        claim_id,
        data,
    )


@router.delete(
    "/{claim_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_claim(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = ClaimService(db)

    await service.delete_claim(claim_id)

    return None