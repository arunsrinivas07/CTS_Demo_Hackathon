from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import (
    AlertSeverity,
    AlertStatus,
    AlertType,
)


class Alert(Base):
    __tablename__ = "alerts"

    __table_args__ = (
        Index(
            "ix_alerts_status_severity_created",
            "status",
            "severity",
            "created_at",
        ),
    )

    alert_id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    claim_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("claims.claim_id"),
        nullable=False,
    )

    risk_id: Mapped[UUID] = mapped_column(
        ForeignKey("risk_assessments.risk_id"),
        nullable=False,
    )

    alert_type: Mapped[AlertType] = mapped_column(
        SAEnum(
            AlertType,
            name="alert_type_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    severity: Mapped[AlertSeverity] = mapped_column(
        SAEnum(
            AlertSeverity,
            name="alert_severity_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[AlertStatus] = mapped_column(
        SAEnum(
            AlertStatus,
            name="alert_status_enum",
            native_enum=True,
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    claim = relationship(
        "Claim",
        back_populates="alerts",
    )

    risk = relationship(
        "RiskAssessment",
        back_populates="alerts",
    )

    investigations = relationship(
        "Investigation",
        back_populates="alert",
    )