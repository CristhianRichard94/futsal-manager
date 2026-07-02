from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_admin, get_current_user
from database import get_db
from models import Field, Reservation, ReservationStatus, User, Venue
from schemas import FieldIn, FieldOut, VenueIn, VenueOut

router = APIRouter(tags=["venues"])


def _get_owned_venue(venue_id: int, current_user: User, db: Session) -> Venue:
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    if venue.admin_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner of this venue")
    return venue


@router.get("/venues", response_model=list[VenueOut])
def list_venues(
    admin_user_id: int | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Venue]:
    if admin_user_id is not None:
        if admin_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot query venues for another admin",
            )
        return db.query(Venue).filter(Venue.admin_user_id == admin_user_id).all()
    return db.query(Venue).all()


@router.get("/venues/{venue_id}", response_model=VenueOut)
def get_venue(
    venue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Venue:
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return venue


@router.post("/venues", response_model=VenueOut, status_code=status.HTTP_201_CREATED)
def create_venue(
    payload: VenueIn,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Venue:
    venue = Venue(**payload.model_dump(), admin_user_id=current_user.id)
    db.add(venue)
    db.commit()
    db.refresh(venue)
    return venue


@router.put("/venues/{venue_id}", response_model=VenueOut)
def update_venue(
    venue_id: int,
    payload: VenueIn,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Venue:
    venue = _get_owned_venue(venue_id, current_user, db)
    for key, value in payload.model_dump().items():
        setattr(venue, key, value)
    db.commit()
    db.refresh(venue)
    return venue


@router.delete("/venues/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue(
    venue_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    venue = _get_owned_venue(venue_id, current_user, db)

    has_active_reservations = (
        db.query(Reservation)
        .join(Field, Reservation.field_id == Field.id)
        .filter(
            Field.venue_id == venue_id,
            Reservation.status != ReservationStatus.cancelled,
        )
        .first()
        is not None
    )
    if has_active_reservations:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete venue: it has fields with non-cancelled reservations. "
            "Cancel those reservations first.",
        )

    db.delete(venue)
    db.commit()


@router.get("/venues/{venue_id}/fields", response_model=list[FieldOut])
def list_venue_fields(
    venue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Field]:
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return db.query(Field).filter(Field.venue_id == venue_id).all()


@router.post("/venues/{venue_id}/fields", response_model=FieldOut, status_code=status.HTTP_201_CREATED)
def create_venue_field(
    venue_id: int,
    payload: FieldIn,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Field:
    _get_owned_venue(venue_id, current_user, db)
    field = Field(**payload.model_dump(), venue_id=venue_id)
    db.add(field)
    db.commit()
    db.refresh(field)
    return field
