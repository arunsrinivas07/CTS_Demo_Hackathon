from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.beneficiary import (
    Beneficiary,
    BeneficiarySnapshot,
)
from app.repositories.beneficiary_repo import (
    BeneficiaryRepository,
)
from app.schema.beneficiary_schema import (
    BeneficiaryCreate,
    BeneficiarySnapshotCreate,
    BeneficiaryUpdate,
)


class BeneficiaryService:

    def __init__(self, db: AsyncSession):
        self.repository = BeneficiaryRepository(db)

    async def create_beneficiary(
        self,
        data: BeneficiaryCreate,
    ) -> Beneficiary:

        existing = await self.repository.get_by_id(
            data.beneficiary_id
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Beneficiary already exists",
            )

        beneficiary = Beneficiary(
            **data.model_dump()
        )

        return await self.repository.create(
            beneficiary
        )

    async def get_beneficiary(
        self,
        beneficiary_id: str,
    ) -> Beneficiary:

        beneficiary = await self.repository.get_by_id(
            beneficiary_id
        )

        if not beneficiary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Beneficiary not found",
            )

        return beneficiary

    async def update_beneficiary(
        self,
        beneficiary_id: str,
        data: BeneficiaryUpdate,
    ) -> Beneficiary:

        beneficiary = await self.get_beneficiary(
            beneficiary_id
        )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(
                beneficiary,
                field,
                value,
            )

        return await self.repository.update(
            beneficiary
        )

    async def create_snapshot(
        self,
        beneficiary_id: str,
        data: BeneficiarySnapshotCreate,
    ) -> BeneficiarySnapshot:

        await self.get_beneficiary(
            beneficiary_id
        )

        existing_snapshots = (
            await self.repository.get_snapshots(
                beneficiary_id
            )
        )

        for snapshot in existing_snapshots:
            if (
                snapshot.snapshot_year
                == data.snapshot_year
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Snapshot for this beneficiary "
                        "and year already exists"
                    ),
                )

        snapshot = BeneficiarySnapshot(
            beneficiary_id=beneficiary_id,
            **data.model_dump(),
        )

        return await self.repository.create_snapshot(
            snapshot
        )

    async def get_snapshots(
        self,
        beneficiary_id: str,
    ):

        await self.get_beneficiary(
            beneficiary_id
        )

        return await self.repository.get_snapshots(
            beneficiary_id
        )

    async def get_context(
        self,
        beneficiary_id: str,
        claim_year: int,
    ):

        await self.get_beneficiary(
            beneficiary_id
        )

        snapshot = (
            await self.repository.get_context_snapshot(
                beneficiary_id,
                claim_year,
            )
        )

        return {
            "beneficiary_id": beneficiary_id,
            "claim_year": claim_year,
            "snapshot": snapshot,
        }