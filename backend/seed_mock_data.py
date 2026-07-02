# ponytail: throwaway dev seed data, not part of the app. Safe to delete this
# file (and its rows: 2 users, 2 venues, 5 fields, a couple reservations)
# whenever real data/venue admins exist. Run with: python seed_mock_data.py

from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models import Field, FieldSize, Reservation, ReservationStatus, User, UserRole, Venue

db = SessionLocal()

try:
    admin = db.query(User).filter_by(email="admin@example.com").first()
    if not admin:
        admin = User(
            google_id="mock-admin-google-id",
            email="admin@example.com",
            name="Mariano Gimenez",
            role=UserRole.venue_admin,
        )
        db.add(admin)
        db.flush()

    player = db.query(User).filter_by(email="player@example.com").first()
    if not player:
        player = User(
            google_id="mock-player-google-id",
            email="player@example.com",
            name="Lucas Benitez",
            role=UserRole.player,
        )
        db.add(player)
        db.flush()

    if not db.query(Venue).first():
        venue1 = Venue(
            name="Complejo Costanera",
            address="Costanera Sur 850, Concepción del Uruguay",
            phone="03442-421100",
            logo_url="https://picsum.photos/seed/complejo-costanera/200/200",
            admin_user_id=admin.id,
        )
        venue2 = Venue(
            name="Club Estudiantes",
            address="9 de Julio 780, Concepción del Uruguay",
            phone="03442-425500",
            logo_url="https://picsum.photos/seed/club-estudiantes/200/200",
            admin_user_id=admin.id,
        )
        db.add_all([venue1, venue2])
        db.flush()

        fields = [
            Field(venue_id=venue1.id, name="Cancha 1", size=FieldSize.five,
                  image_url="https://picsum.photos/seed/cancha-1/600/400"),
            Field(venue_id=venue1.id, name="Cancha 2", size=FieldSize.seven,
                  image_url="https://picsum.photos/seed/cancha-2/600/400"),
            Field(venue_id=venue2.id, name="Cancha Principal", size=FieldSize.eleven,
                  image_url="https://picsum.photos/seed/cancha-principal/600/400"),
            Field(venue_id=venue2.id, name="Cancha Auxiliar", size=FieldSize.five,
                  image_url="https://picsum.photos/seed/cancha-auxiliar/600/400"),
            Field(venue_id=venue2.id, name="Cancha 7", size=FieldSize.seven,
                  image_url="https://picsum.photos/seed/cancha-7/600/400"),
        ]
        db.add_all(fields)
        db.flush()

        tomorrow_10am = (datetime.now(timezone.utc) + timedelta(days=1)).replace(
            hour=10, minute=0, second=0, microsecond=0
        )
        db.add(Reservation(
            field_id=fields[0].id,
            user_id=player.id,
            start_time=tomorrow_10am,
            end_time=tomorrow_10am + timedelta(hours=1),
            status=ReservationStatus.confirmed,
        ))

    db.commit()
    print("Seeded mock data.")
finally:
    db.close()
