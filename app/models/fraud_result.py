from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FraudResult(Base):
    __tablename__ = "fraud_results"

    __table_args__ = (
        Index(
            "ix_fraud_results_claim_model",
            "claim_id",
            "model_id",
        ),
    )

    result_id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    claim_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("claims.claim_id"),
        nullable=False,
    )

    model_id: Mapped[UUID] = mapped_column(
        ForeignKey("models.model_id"),
        nullable=False,
    )

    fraud_probability: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
    )

    fraud_prediction: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    feature_version: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    claim = relationship(
        "Claim",
        back_populates="fraud_results",
    )

    model = relationship(
        "ModelRegistry",
        back_populates="fraud_results",
    )

    risk_assessments = relationship(
        "RiskAssessment",
        back_populates="fraud_result",
    )