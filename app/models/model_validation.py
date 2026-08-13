from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ModelValidation(Base):
    __tablename__ = "model_validation"

    validation_id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    model_id: Mapped[UUID] = mapped_column(
        ForeignKey("models.model_id"),
        nullable=False,
    )

    experiment_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    dataset_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    feature_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    row_count: Mapped[int] = mapped_column(
        nullable=False,
    )

    p90_threshold: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    p95_threshold: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    p97_threshold: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    p98_threshold: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    p99_threshold: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
    )

    stability_jaccard: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 6),
        nullable=True,
    )

    validation_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    model = relationship(
        "ModelRegistry",
        back_populates="validations",
    )