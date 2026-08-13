from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProviderCreate(BaseModel):
    provider_id: str = Field(
        min_length=1,
        max_length=64,
    )

    provider_type: str | None = Field(
        default=None,
        max_length=30,
    )

    total_claims: int | None = Field(
        default=None,
        ge=0,
    )

    provider_claim_volume: Decimal | None = Field(
        default=None,
        ge=0,
    )

    provider_avg_claim_payment: Decimal | None = Field(
        default=None,
        ge=0,
    )

    anomalous_claim_count: int | None = Field(
        default=None,
        ge=0,
    )

    anomaly_rate: Decimal | None = Field(
        default=None,
        ge=0,
        le=1,
    )


class ProviderUpdate(BaseModel):
    provider_type: str | None = Field(
        default=None,
        max_length=30,
    )

    total_claims: int | None = Field(
        default=None,
        ge=0,
    )

    provider_claim_volume: Decimal | None = Field(
        default=None,
        ge=0,
    )

    provider_avg_claim_payment: Decimal | None = Field(
        default=None,
        ge=0,
    )

    anomalous_claim_count: int | None = Field(
        default=None,
        ge=0,
    )

    anomaly_rate: Decimal | None = Field(
        default=None,
        ge=0,
        le=1,
    )


class ProviderResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    provider_id: str
    provider_type: str | None
    total_claims: int | None
    provider_claim_volume: Decimal | None
    provider_avg_claim_payment: Decimal | None
    anomalous_claim_count: int | None
    anomaly_rate: Decimal | None
    last_updated: datetime | None

class ProviderListResponse(BaseModel):
    items: list[ProviderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int