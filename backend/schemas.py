from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models import FieldSize, PaymentStatus, ReservationStatus, UserRole

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


class UserSyncIn(BaseModel):
    google_id: str
    email: str
    name: str
    avatar_url: str | None = None


class UserSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    google_id: str
    email: str
    name: str
    avatar_url: str | None
    role: UserRole
    phone: str | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Venues
# ---------------------------------------------------------------------------


class VenueIn(BaseModel):
    name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    logo_url: str | None = None
    deposit_required: bool = False


class VenueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    phone: str
    logo_url: str | None
    admin_user_id: int
    deposit_required: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Fields
# ---------------------------------------------------------------------------


class FieldIn(BaseModel):
    name: str = Field(min_length=1)
    size: FieldSize
    image_url: str | None = None


class FieldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    venue_id: int
    name: str
    size: FieldSize
    image_url: str | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Reservations
# ---------------------------------------------------------------------------


class ReservationIn(BaseModel):
    field_id: int
    start_time: datetime
    end_time: datetime


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reservation_id: int
    status: PaymentStatus
    amount: int
    created_at: datetime
    updated_at: datetime


class ReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    field_id: int
    user_id: int
    user: UserSummaryOut
    start_time: datetime
    end_time: datetime
    status: ReservationStatus
    payment: PaymentOut | None
    created_at: datetime
    updated_at: datetime


class ReservationWithCheckoutOut(ReservationOut):
    checkout_url: str | None = None


class AvailabilityOut(BaseModel):
    start_time: datetime
    end_time: datetime
