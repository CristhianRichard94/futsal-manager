from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_admin
from database import get_db
from models import Field, Reservation, ReservationStatus, User
from schemas import AvailabilityOut, FieldIn, FieldOut

router = APIRouter(tags=["fields"])


def _get_owned_field(field_id: int, current_user: User, db: Session) -> Field:
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")
    if field.venue.admin_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner of this field's venue")
    return field


@router.get("/fields/{field_id}", response_model=FieldOut)
def get_field(field_id: int, db: Session = Depends(get_db)) -> Field:
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")
    return field


@router.put("/fields/{field_id}", response_model=FieldOut)
def update_field(
    field_id: int,
    payload: FieldIn,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Field:
    field = _get_owned_field(field_id, current_user, db)
    for key, value in payload.model_dump().items():
        setattr(field, key, value)
    db.commit()
    db.refresh(field)
    return field


@router.delete("/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    field_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    field = _get_owned_field(field_id, current_user, db)

    has_active_reservations = (
        db.query(Reservation)
        .filter(
            Reservation.field_id == field_id,
            Reservation.status != ReservationStatus.cancelled,
        )
        .first()
        is not None
    )
    if has_active_reservations:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete field: it has non-cancelled reservations. "
            "Cancel those reservations first.",
        )

    db.delete(field)
    db.commit()


@router.get("/fields/{field_id}/availability", response_model=list[AvailabilityOut])
def get_field_availability(
    field_id: int,
    day: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> list[Reservation]:
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")

    # The `date` query param is interpreted as a UTC calendar day.
    day_start = datetime.combine(day, time.min, tzinfo=timezone.utc)
    day_end = datetime.combine(day, time.max, tzinfo=timezone.utc)

    return (
        db.query(Reservation)
        .filter(
            Reservation.field_id == field_id,
            Reservation.status == ReservationStatus.confirmed,
            Reservation.start_time <= day_end,
            Reservation.end_time >= day_start,
        )
        .all()
    )
