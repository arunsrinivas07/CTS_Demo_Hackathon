from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    beneficiary_id: Mapped[str] = mapped_column(
        String(32),
        primary_key=True,
    )

    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    sex_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    esrd_indicator: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    hi_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    smi_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    hmo_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    plan_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    bene_age: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chronic_condition_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    claims = relationship(
        "Claim",
        back_populates="beneficiary",
    )

    snapshots = relationship(
        "BeneficiarySnapshot",
        back_populates="beneficiary",
        cascade="all, delete-orphan",
    )

from sqlalchemy import UniqueConstraint, Index

class BeneficiarySnapshot(Base):
    __tablename__ = "beneficiary_snapshots"

    __table_args__ = (
        UniqueConstraint(
            "beneficiary_id",
            "snapshot_year",
            name="uq_beneficiary_snapshot_year",
        ),
        Index(
            "ix_beneficiary_snapshots_lookup",
            "beneficiary_id",
            "snapshot_year",
        ),
    )

    snapshot_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    beneficiary_id: Mapped[str] = mapped_column(
        String(32),
        ForeignKey("beneficiaries.beneficiary_id"),
        nullable=False,
    )

    snapshot_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    sex_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    esrd_indicator: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    hi_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    smi_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    hmo_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    plan_coverage_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chronic_condition_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    source_version: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    beneficiary = relationship(
        "Beneficiary",
        back_populates="snapshots",
    )