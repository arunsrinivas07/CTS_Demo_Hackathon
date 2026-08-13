from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Provider(Base):
    __tablename__ = "providers"

    provider_id: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
    )

    provider_type: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    total_claims: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    provider_claim_volume: Mapped[Decimal | None] = mapped_column(
        Numeric(18, 2),
        nullable=True,
    )

    provider_avg_claim_payment: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2),
        nullable=True,
    )

    anomalous_claim_count: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    anomaly_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 6),
        nullable=True,
    )

    last_updated: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    claims = relationship(
        "Claim",
        back_populates="provider",
    )