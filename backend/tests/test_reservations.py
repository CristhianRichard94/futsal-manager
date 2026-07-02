"""Proof-of-life tests for the reservations flow: happy path create, and
double-booking rejection (409), which is enforced both at the app level and
by the reservations_no_overlap GIST exclusion constraint (models.py)."""

from datetime import datetime, timedelta, timezone

from models import Field, FieldSize, User, UserRole, Venue


def _make_user(db_session, email: str) -> User:
    user = User(google_id=f"google-{email}", email=email, name="Test User", role=UserRole.player)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _make_venue_and_field(db_session, admin_user: User) -> tuple[Venue, Field]:
    venue = Venue(
        name="Test Venue",
        address="123 Main St",
        phone="555-0100",
        admin_user_id=admin_user.id,
        deposit_required=False,
    )
    db_session.add(venue)
    db_session.commit()
    db_session.refresh(venue)

    field = Field(venue_id=venue.id, name="Field 1", size=FieldSize.five)
    db_session.add(field)
    db_session.commit()
    db_session.refresh(field)

    return venue, field


def test_create_reservation_succeeds(client, db_session, override_current_user):
    admin = _make_user(db_session, "admin@example.com")
    player = _make_user(db_session, "player@example.com")
    _, field = _make_venue_and_field(db_session, admin)
    override_current_user(player)

    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=1)

    response = client.post(
        "/reservations",
        json={
            "field_id": field.id,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "confirmed"
    assert body["field_id"] == field.id


def test_overlapping_reservation_is_rejected(client, db_session, override_current_user):
    admin = _make_user(db_session, "admin2@example.com")
    player = _make_user(db_session, "player2@example.com")
    _, field = _make_venue_and_field(db_session, admin)
    override_current_user(player)

    start = datetime.now(timezone.utc) + timedelta(days=2)
    end = start + timedelta(hours=1)

    first = client.post(
        "/reservations",
        json={"field_id": field.id, "start_time": start.isoformat(), "end_time": end.isoformat()},
    )
    assert first.status_code == 201

    overlap_start = start + timedelta(minutes=30)
    overlap_end = overlap_start + timedelta(hours=1)

    second = client.post(
        "/reservations",
        json={
            "field_id": field.id,
            "start_time": overlap_start.isoformat(),
            "end_time": overlap_end.isoformat(),
        },
    )

    assert second.status_code == 409
