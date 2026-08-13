from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.beneficiary import (
    Beneficiary,
    BeneficiarySnapshot,
)


class BeneficiaryRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        beneficiary: Beneficiary,
    ) -> Beneficiary:

        self.db.add(beneficiary)

        await self.db.commit()
        await self.db.refresh(beneficiary)

        return beneficiary

    async def get_by_id(
        self,
        beneficiary_id: str,
    ) -> Beneficiary | None:

        result = await self.db.execute(
            select(Beneficiary).where(
                Beneficiary.beneficiary_id
                == beneficiary_id
            )
        )

        return result.scalar_one_or_none()

    async def update(
        self,
        beneficiary: Beneficiary,
    ) -> Beneficiary:

        await self.db.commit()
        await self.db.refresh(beneficiary)

        return beneficiary

    async def create_snapshot(
        self,
        snapshot: BeneficiarySnapshot,
    ) -> BeneficiarySnapshot:

        self.db.add(snapshot)

        await self.db.commit()
        await self.db.refresh(snapshot)

        return snapshot

    async def get_snapshots(
        self,
        beneficiary_id: str,
    ) -> list[BeneficiarySnapshot]:

        result = await self.db.execute(
            select(BeneficiarySnapshot)
            .where(
                BeneficiarySnapshot.beneficiary_id
                == beneficiary_id
            )
            .order_by(
                BeneficiarySnapshot.snapshot_year.desc()
            )
        )

        return list(result.scalars().all())

    async def get_context_snapshot(
        self,
        beneficiary_id: str,
        claim_year: int,
    ) -> BeneficiarySnapshot | None:

        result = await self.db.execute(
            select(BeneficiarySnapshot)
            .where(
                BeneficiarySnapshot.beneficiary_id
                == beneficiary_id,
                BeneficiarySnapshot.snapshot_year
                <= claim_year,
            )
            .order_by(
                BeneficiarySnapshot.snapshot_year.desc()
            )
            .limit(1)
        )

        return result.scalar_one_or_none()