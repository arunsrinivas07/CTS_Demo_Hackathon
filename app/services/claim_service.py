import math
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.claim import Claim
from app.models.enums import ClaimType
from app.repositories.claim_repo import ClaimRepository
from app.schema.claim_schema import (
    ClaimCreate,
    ClaimUpdate,
)


class ClaimService:

    def __init__(self, db: AsyncSession):
        self.repository = ClaimRepository(db)

    async def create_claim(
        self,
        data: ClaimCreate,
    ) -> Claim:

        existing_claim = await self.repository.get_by_id(
            data.claim_id
        )

        if existing_claim:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Claim already exists",
            )

        if (
            data.claim_end_date is not None
            and data.claim_end_date < data.claim_start_date
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="claim_end_date cannot be before claim_start_date",
            )

        claim = Claim(
            claim_id=data.claim_id,
            beneficiary_id=data.beneficiary_id,
            claim_type=data.claim_type,
            provider_id=data.provider_id,
            claim_start_date=data.claim_start_date,
            claim_end_date=data.claim_end_date,
            claim_amount=data.claim_amount,
        )

        return await self.repository.create(claim)

    async def get_claim(
        self,
        claim_id: str,
    ) -> Claim:

        claim = await self.repository.get_by_id(
            claim_id
        )

        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found",
            )

        return claim

    async def get_claims(
        self,
        *,
        page: int,
        page_size: int,
        claim_type: ClaimType | None,
        provider_id: str | None,
        beneficiary_id: str | None,
        start_date: date | None,
        end_date: date | None,
    ):

        if start_date and end_date:
            if end_date < start_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="end_date cannot be before start_date",
                )

        claims, total = await self.repository.get_all(
            page=page,
            page_size=page_size,
            claim_type=claim_type,
            provider_id=provider_id,
            beneficiary_id=beneficiary_id,
            start_date=start_date,
            end_date=end_date,
        )

        total_pages = (
            math.ceil(total / page_size)
            if total > 0
            else 0
        )

        return {
            "items": claims,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    async def update_claim(
        self,
        claim_id: str,
        data: ClaimUpdate,
    ) -> Claim:

        claim = await self.get_claim(claim_id)

        update_data = data.model_dump(
            exclude_unset=True
        )

        new_start_date = update_data.get(
            "claim_start_date",
            claim.claim_start_date,
        )

        new_end_date = update_data.get(
            "claim_end_date",
            claim.claim_end_date,
        )

        if (
            new_end_date is not None
            and new_end_date < new_start_date
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="claim_end_date cannot be before claim_start_date",
            )

        for field, value in update_data.items():
            setattr(claim, field, value)

        return await self.repository.update(claim)

    async def delete_claim(
        self,
        claim_id: str,
    ) -> None:

        claim = await self.get_claim(claim_id)

        await self.repository.delete(claim)