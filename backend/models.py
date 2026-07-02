import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func, text
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class FieldSize(str, enum.Enum):
    five = "five"
    seven = "seven"
    eleven = "eleven"


class UserRole(str, enum.Enum):
    player = "player"
    venue_admin = "venue_admin"


class ReservationStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    confirmed = "confirmed"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    google_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False, default=UserRole.player
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    venues: Mapped[list["Venue"]] = relationship(back_populates="admin", cascade="all, delete-orphan")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    admin_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    deposit_required: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    admin: Mapped["User"] = relationship(back_populates="venues")
    fields: Mapped[list["Field"]] = relationship(back_populates="venue", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[int] = mapped_column(primary_key=True)
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[FieldSize] = mapped_column(Enum(FieldSize, name="field_size"), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    venue: Mapped["Venue"] = relationship(back_populates="fields")
    # NOTE: no delete-orphan here on purpose — reservations must survive field
    # deletion for historical/audit purposes. Deletion of a field with
    # non-cancelled reservations is blocked at the router level instead.
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="field")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    field_id: Mapped[int] = mapped_column(ForeignKey("fields.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus, name="reservation_status"),
        nullable=False,
        default=ReservationStatus.confirmed,
    )
    # Only set for reservations created with status=pending_payment, i.e.
    # when the venue requires a deposit. Abandoned checkouts are swept
    # (flipped to cancelled) opportunistically at the top of the
    # create_reservation/list_reservations endpoints — see routers/reservations.py.
    payment_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    field: Mapped["Field"] = relationship(back_populates="reservations")
    user: Mapped["User"] = relationship(back_populates="reservations")
    payment: Mapped["Payment | None"] = relationship(
        back_populates="reservation", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        # Race-safe guarantee against double-booking: two overlapping,
        # confirmed OR pending-payment reservations for the same field can
        # never both commit, even under concurrent requests. Pending-payment
        # reservations must also hold the slot, otherwise two players could
        # both start a deposit checkout for the same slot. Requires the
        # btree_gist extension (enabled at startup in main.py, since we use
        # create_all instead of Alembic migrations). The app-level overlap
        # check in routers/reservations.py remains as a fast-path / clean
        # 409 error; this constraint is the actual source of truth.
        ExcludeConstraint(
            ("field_id", "="),
            (text("tstzrange(start_time, end_time)"), "&&"),
            where=text("status IN ('confirmed', 'pending_payment')"),
            name="reservations_no_overlap",
        ),
    )


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    reservation_id: Mapped[int] = mapped_column(ForeignKey("reservations.id"), nullable=False, unique=True)
    mp_preference_id: Mapped[str] = mapped_column(String(255), nullable=False)
    # Only known once MP notifies us of an actual payment attempt; unique so
    # webhook retries can upsert idempotently instead of creating duplicates.
    mp_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        nullable=False,
        default=PaymentStatus.pending,
    )
    amount: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    reservation: Mapped["Reservation"] = relationship(back_populates="payment")
