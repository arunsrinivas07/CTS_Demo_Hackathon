from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class BeneficiaryCreate(BaseModel):
    beneficiary_id: str = Field(
        min_length=1,
        max_length=32,
    )

    birth_date: date | None = None

    sex_code: str | None = Field(
        default=None,
        max_length=10,
    )

    esrd_indicator: str | None = Field(
        default=None,
        max_length=10,
    )

    hi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    smi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    hmo_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    plan_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    bene_age: int | None = Field(
        default=None,
        ge=0,
    )

    chronic_condition_count: int | None = Field(
        default=None,
        ge=0,
    )


class BeneficiaryUpdate(BaseModel):
    birth_date: date | None = None

    sex_code: str | None = Field(
        default=None,
        max_length=10,
    )

    esrd_indicator: str | None = Field(
        default=None,
        max_length=10,
    )

    hi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    smi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    hmo_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    plan_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    bene_age: int | None = Field(
        default=None,
        ge=0,
    )

    chronic_condition_count: int | None = Field(
        default=None,
        ge=0,
    )


class BeneficiaryResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    beneficiary_id: str
    birth_date: date | None
    sex_code: str | None
    esrd_indicator: str | None
    hi_coverage_months: int | None
    smi_coverage_months: int | None
    hmo_coverage_months: int | None
    plan_coverage_months: int | None
    bene_age: int | None
    chronic_condition_count: int | None
    updated_at: datetime

class BeneficiarySnapshotCreate(BaseModel):
    snapshot_year: int = Field(
        ge=1900,
        le=2100,
    )

    sex_code: str | None = Field(
        default=None,
        max_length=10,
    )

    esrd_indicator: str | None = Field(
        default=None,
        max_length=10,
    )

    hi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    smi_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    hmo_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    plan_coverage_months: int | None = Field(
        default=None,
        ge=0,
    )

    chronic_condition_count: int | None = Field(
        default=None,
        ge=0,
    )

    source_version: str | None = Field(
        default=None,
        max_length=64,
    )


class BeneficiarySnapshotResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    snapshot_id: int
    beneficiary_id: str
    snapshot_year: int
    sex_code: str | None
    esrd_indicator: str | None
    hi_coverage_months: int | None
    smi_coverage_months: int | None
    hmo_coverage_months: int | None
    plan_coverage_months: int | None
    chronic_condition_count: int | None
    source_version: str | None

class BeneficiaryContextResponse(BaseModel):
    beneficiary_id: str
    claim_year: int
    snapshot: BeneficiarySnapshotResponse | None