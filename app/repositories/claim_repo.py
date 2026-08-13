from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ClaimType


class ClaimCreate(BaseModel):
    claim_id: str = Field(
        min_length=1,
        max_length=64,
    )

    beneficiary_id: str = Field(
        min_length=1,
        max_length=32,
    )

    claim_type: ClaimType

    provider_id: str | None = Field(
        default=None,
        max_length=64,
    )

    claim_start_date: date

    claim_end_date: date | None = None

    claim_amount: Decimal = Field(
        ge=0,
        max_digits=14,
        decimal_places=2,
    )


class ClaimUpdate(BaseModel):
    claim_type: ClaimType | None = None

    provider_id: str | None = Field(
        default=None,
        max_length=64,
    )

    claim_start_date: date | None = None

    claim_end_date: date | None = None

    claim_amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=14,
        decimal_places=2,
    )


class ClaimResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    claim_id: str
    beneficiary_id: str
    claim_type: ClaimType
    provider_id: str | None
    claim_start_date: date
    claim_end_date: date | None
    claim_amount: Decimal
    created_at: datetime
    updated_at: datetime


class ClaimListResponse(BaseModel):
    items: list[ClaimResponse]
    total: int
    page: int
    page_size: int
    total_pages: int