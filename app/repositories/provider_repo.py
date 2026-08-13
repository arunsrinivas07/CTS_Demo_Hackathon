from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.provider import Provider


class ProviderRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        provider: Provider,
    ) -> Provider:

        self.db.add(provider)

        await self.db.commit()
        await self.db.refresh(provider)

        return provider

    async def get_by_id(
        self,
        provider_id: str,
    ) -> Provider | None:

        result = await self.db.execute(
            select(Provider).where(
                Provider.provider_id == provider_id
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        page: int,
        page_size: int,
    ) -> tuple[list[Provider], int]:

        count_result = await self.db.execute(
            select(
                func.count()
            ).select_from(Provider)
        )

        total = count_result.scalar_one()

        offset = (page - 1) * page_size

        result = await self.db.execute(
            select(Provider)
            .order_by(Provider.provider_id)
            .offset(offset)
            .limit(page_size)
        )

        providers = list(result.scalars().all())

        return providers, total

    async def update(
        self,
        provider: Provider,
    ) -> Provider:

        await self.db.commit()
        await self.db.refresh(provider)

        return provider