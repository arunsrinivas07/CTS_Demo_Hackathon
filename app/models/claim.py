from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ClaimType
from sqlalchemy import Enum as SAEnum

class Claim(Base):
    __tablename__ = "claims"

    __table_args__ = (
        Index(
            "ix_claims_beneficiary_id",
            "beneficiary_id",
        ),
        Index(
            "ix_claims_provider_id",
            "provider_id",
        ),
        Index(
            "ix_claims_type_start_date",
            "claim_type",
            "claim_start_date",
        ),
        Index(
            "ix_claims_type_claim_id",
            "claim_type",
            "claim_id",
        ),
    )

    claim_id: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
    )

    beneficiary_id: Mapped[str] = mapped_column(
        String(32),
        ForeignKey("beneficiaries.beneficiary_id"),
        nullable=False,
    )

    claim_type: Mapped[ClaimType] = mapped_column(
    SAEnum(
        ClaimType,
        name="claim_type_enum",
        native_enum=True,
    ),
    nullable=False,
)

    provider_id: Mapped[str | None] = mapped_column(
        String(64),
        ForeignKey("providers.provider_id"),
        nullable=True,
    )

    claim_start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    claim_end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    claim_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    provider = relationship(
        "Provider",
        back_populates="claims",
    )

    beneficiary = relationship(
        "Beneficiary",
        back_populates="claims",
    )

    anomaly_results = relationship(
        "AnomalyResult",
        back_populates="claim",
    )

    fraud_results = relationship(
        "FraudResult",
        back_populates="claim",
    )

    risk_assessments = relationship(
        "RiskAssessment",
        back_populates="claim",
    )

    alerts = relationship(
        "Alert",
        back_populates="claim",
    )

    investigations = relationship(
        "Investigation",
        back_populates="claim",
    )