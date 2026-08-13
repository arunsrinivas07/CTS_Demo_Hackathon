from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import RiskDecision, RiskLevel


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    __table_args__ = (
        Index(
            "ix_risk_assessments_level_created",
            "risk_level",
            "created_at",
        ),
    )

    risk_id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    claim_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("claims.claim_id"),
        nullable=False,
    )

    anomaly_result_id: Mapped[UUID] = mapped_column(
        ForeignKey("anomaly_results.result_id"),
        nullable=False,
    )

    fraud_result_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("fraud_results.result_id"),
        nullable=True,
    )

    anomaly_score: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    fraud_probability: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 6),
        nullable=True,
    )

    risk_score: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 6),
        nullable=True,
    )

    risk_level: Mapped[RiskLevel] = mapped_column(
        SAEnum(
            RiskLevel,
            name="risk_level_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    decision: Mapped[RiskDecision] = mapped_column(
        SAEnum(
            RiskDecision,
            name="risk_decision_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    rule_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    claim = relationship(
        "Claim",
        back_populates="risk_assessments",
    )

    anomaly_result = relationship(
        "AnomalyResult",
        back_populates="risk_assessments",
    )

    fraud_result = relationship(
        "FraudResult",
        back_populates="risk_assessments",
    )

    alerts = relationship(
        "Alert",
        back_populates="risk",
    )