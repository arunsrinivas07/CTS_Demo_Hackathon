from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import math
from app.models.provider import Provider
from app.repositories.provider_repo import ProviderRepository
from app.schema.provider_schema import (
    ProviderCreate,
    ProviderUpdate,
)


class ProviderService:

    def __init__(self, db: AsyncSession):
        self.repository = ProviderRepository(db)

    async def create_provider(
        self,
        data: ProviderCreate,
    ) -> Provider:

        existing = await self.repository.get_by_id(
            data.provider_id
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Provider already exists",
            )

        provider = Provider(
            **data.model_dump()
        )

        return await self.repository.create(provider)

    async def get_provider(
        self,
        provider_id: str,
    ) -> Provider:

        provider = await self.repository.get_by_id(
            provider_id
        )

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found",
            )

        return provider

    async def get_providers(
        self,
        page: int,
        page_size: int,
    ):

        providers, total = await self.repository.get_all(
            page,
            page_size,
        )

        return {
            "items": providers,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (
                math.ceil(total / page_size)
                if total
                else 0
            ),
        }

    async def update_provider(
        self,
        provider_id: str,
        data: ProviderUpdate,
    ) -> Provider:

        provider = await self.get_provider(
            provider_id
        )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(provider, field, value)

        return await self.repository.update(provider)