from sqlalchemy import text
from sqlalchemy.orm import Session


def sweep_expired_pending_payments(db: Session) -> None:
    """Opportunistically cancel abandoned checkouts.

    No background scheduler/worker in this app (create_all instead of
    Alembic, no cron infra) — this runs inline at the top of the read/write
    endpoints below instead, so expired holds never block a real booking for
    longer than the pending-payment TTL (see PENDING_PAYMENT_TTL_MINUTES in
    routers/reservations.py).

    Shared between routers/reservations.py and routers/fields.py so both the
    reservation list/create endpoints and the availability calendar reflect
    freshly-expired holds without duplicating the SQL.
    """
    db.execute(
        text(
            "UPDATE reservations SET status = 'cancelled' "
            "WHERE status = 'pending_payment' AND payment_expires_at < now()"
        )
    )
    db.commit()
