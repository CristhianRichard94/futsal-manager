from datetime import datetime, timedelta, timezone

import mercadopago
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from config import settings
from database import get_db
from db_utils import sweep_expired_pending_payments
from models import Field, Payment, Reservation, ReservationStatus, User, UserRole, Venue
from schemas import ReservationIn, ReservationOut, ReservationWithCheckoutOut

router = APIRouter(prefix="/reservations", tags=["reservations"])

# Reservations created as pending_payment (deposit checkout in progress) hold
# the slot for this long. If the checkout isn't completed within the window,
# the reservation is swept back to cancelled the next time it's touched — see
# sweep_expired_pending_payments in db_utils.py.
PENDING_PAYMENT_TTL_MINUTES = 15


@router.get("", response_model=list[ReservationOut])
def list_reservations(
    venue_id: int | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Reservation]:
    sweep_expired_pending_payments(db)

    if venue_id is not None:
        if current_user.role != UserRole.venue_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Venue admin role required")
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        if not venue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        if venue.admin_user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner of this venue")

        return (
            db.query(Reservation)
            .join(Field, Reservation.field_id == Field.id)
            .filter(Field.venue_id == venue_id)
            .options(selectinload(Reservation.user), selectinload(Reservation.payment))
            .all()
        )

    return (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .options(selectinload(Reservation.user), selectinload(Reservation.payment))
        .all()
    )


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Reservation:
    reservation = (
        db.query(Reservation)
        .filter(Reservation.id == reservation_id)
        .options(selectinload(Reservation.user), selectinload(Reservation.payment))
        .first()
    )
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")

    is_owner = reservation.user_id == current_user.id
    is_venue_admin_owner = (
        current_user.role == UserRole.venue_admin
        and reservation.field.venue.admin_user_id == current_user.id
    )
    if not (is_owner or is_venue_admin_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this reservation")

    return reservation


@router.post("", response_model=ReservationWithCheckoutOut, status_code=status.HTTP_201_CREATED)
def create_reservation(
    payload: ReservationIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Reservation:
    sweep_expired_pending_payments(db)

    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="end_time must be after start_time")

    field = db.query(Field).filter(Field.id == payload.field_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")

    overlapping = (
        db.query(Reservation)
        .filter(
            Reservation.field_id == payload.field_id,
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.pending_payment]),
            Reservation.start_time < payload.end_time,
            Reservation.end_time > payload.start_time,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This field is already booked for the requested time range",
        )

    deposit_required = field.venue.deposit_required

    reservation = Reservation(
        field_id=payload.field_id,
        user_id=current_user.id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=ReservationStatus.pending_payment if deposit_required else ReservationStatus.confirmed,
        payment_expires_at=(
            datetime.now(timezone.utc) + timedelta(minutes=PENDING_PAYMENT_TTL_MINUTES)
            if deposit_required
            else None
        ),
    )
    db.add(reservation)
    try:
        db.commit()
    except IntegrityError:
        # Defense in depth: the app-level overlap check above is a fast
        # path for the common case, but it's inherently racy (TOCTOU) under
        # concurrent requests. The DB-level exclusion constraint
        # (reservations_no_overlap, see models.py) is the actual
        # race-safe guarantee — this catches the case where two concurrent
        # requests both passed the overlap check before either committed.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This field is already booked for the requested time range",
        )
    db.refresh(reservation)

    checkout_url: str | None = None
    if deposit_required:
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        preference_data = {
            "items": [
                {
                    "title": f"Deposit for reservation #{reservation.id}",
                    "quantity": 1,
                    "currency_id": "ARS",
                    "unit_price": settings.DEPOSIT_AMOUNT,
                }
            ],
            "external_reference": str(reservation.id),
            "back_urls": {
                "success": f"{settings.FRONTEND_BASE_URL}/venues/{field.venue_id}/book/return",
                "pending": f"{settings.FRONTEND_BASE_URL}/venues/{field.venue_id}/book/return",
                "failure": f"{settings.FRONTEND_BASE_URL}/venues/{field.venue_id}/book/return",
            },
            "auto_return": "approved",
            "notification_url": f"{settings.BACKEND_BASE_URL}/payments/webhook",
        }
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        payment = Payment(
            reservation_id=reservation.id,
            mp_preference_id=preference["id"],
            amount=settings.DEPOSIT_AMOUNT,
        )
        db.add(payment)
        db.commit()
        db.refresh(reservation)

        checkout_url = preference["init_point"]

    return ReservationWithCheckoutOut.model_validate(reservation).model_copy(update={"checkout_url": checkout_url})


@router.delete("/{reservation_id}", response_model=ReservationOut)
def cancel_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Reservation:
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")

    is_owner = reservation.user_id == current_user.id
    is_venue_admin_owner = (
        current_user.role == UserRole.venue_admin
        and reservation.field.venue.admin_user_id == current_user.id
    )
    if not (is_owner or is_venue_admin_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this reservation")

    reservation.status = ReservationStatus.cancelled
    db.commit()
    db.refresh(reservation)
    return reservation
