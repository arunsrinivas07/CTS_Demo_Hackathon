from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schema.provider_schema import (
    ProviderCreate,
    ProviderListResponse,
    ProviderResponse,
    ProviderUpdate,
)
from app.services.provider_service import ProviderService


router = APIRouter(
    prefix="/providers",
    tags=["Providers"],
)


@router.post(
    "",
    response_model=ProviderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_provider(
    data: ProviderCreate,
    db: AsyncSession = Depends(get_db),
):
    service = ProviderService(db)

    return await service.create_provider(data)


@router.get(
    "",
    response_model=ProviderListResponse,
)
async def get_providers(
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: AsyncSession = Depends(get_db),
):
    service = ProviderService(db)

    return await service.get_providers(
        page,
        page_size,
    )


@router.get(
    "/{provider_id}",
    response_model=ProviderResponse,
)
async def get_provider(
    provider_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = ProviderService(db)

    return await service.get_provider(
        provider_id
    )


@router.patch(
    "/{provider_id}",
    response_model=ProviderResponse,
)
async def update_provider(
    provider_id: str,
    data: ProviderUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = ProviderService(db)

    return await service.update_provider(
        provider_id,
        data,
    )