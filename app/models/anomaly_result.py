from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ClaimType, ModelStatus, ModelType


class ModelRegistry(Base):
    __tablename__ = "models"

    model_id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model_type: Mapped[ModelType] = mapped_column(
        SAEnum(
            ModelType,
            name="model_type_enum",
            native_enum=True,
        ),
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

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    feature_version: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    feature_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    training_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    training_dataset_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    artifact_uri: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    threshold: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 8),
        nullable=True,
    )

    status: Mapped[ModelStatus] = mapped_column(
        SAEnum(
            ModelStatus,
            name="model_status_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    anomaly_results = relationship(
        "AnomalyResult",
        back_populates="model",
    )

    fraud_results = relationship(
        "FraudResult",
        back_populates="model",
    )

    validations = relationship(
        "ModelValidation",
        back_populates="model",
    )