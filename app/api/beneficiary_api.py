from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schema.beneficiary_schema import (
    BeneficiaryContextResponse,
    BeneficiaryCreate,
    BeneficiaryResponse,
    BeneficiarySnapshotCreate,
    BeneficiarySnapshotResponse,
    BeneficiaryUpdate,
)
from app.services.beneficiary_service import (
    BeneficiaryService,
)


router = APIRouter(
    prefix="/beneficiaries",
    tags=["Beneficiaries"],
)


@router.post(
    "",
    response_model=BeneficiaryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_beneficiary(
    data: BeneficiaryCreate,
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.create_beneficiary(
        data
    )


@router.get(
    "/{beneficiary_id}",
    response_model=BeneficiaryResponse,
)
async def get_beneficiary(
    beneficiary_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.get_beneficiary(
        beneficiary_id
    )


@router.patch(
    "/{beneficiary_id}",
    response_model=BeneficiaryResponse,
)
async def update_beneficiary(
    beneficiary_id: str,
    data: BeneficiaryUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.update_beneficiary(
        beneficiary_id,
        data,
    )


@router.post(
    "/{beneficiary_id}/snapshots",
    response_model=BeneficiarySnapshotResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_snapshot(
    beneficiary_id: str,
    data: BeneficiarySnapshotCreate,
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.create_snapshot(
        beneficiary_id,
        data,
    )


@router.get(
    "/{beneficiary_id}/snapshots",
    response_model=list[BeneficiarySnapshotResponse],
)
async def get_snapshots(
    beneficiary_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.get_snapshots(
        beneficiary_id
    )


@router.get(
    "/{beneficiary_id}/context",
    response_model=BeneficiaryContextResponse,
)
async def get_beneficiary_context(
    beneficiary_id: str,
    claim_year: int = Query(
        ...,
        ge=1900,
        le=2100,
    ),
    db: AsyncSession = Depends(get_db),
):
    service = BeneficiaryService(db)

    return await service.get_context(
        beneficiary_id,
        claim_year,
    )