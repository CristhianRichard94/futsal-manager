import logging

import mercadopago
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Payment, PaymentStatus, Reservation, ReservationStatus

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Maps Mercado Pago's payment `status` values to our internal PaymentStatus.
# Anything not "approved" is treated as rejected/failed for our purposes —
# there's no partial/refunded handling in this MVP.
_MP_STATUS_MAP = {
    "approved": PaymentStatus.approved,
    "pending": PaymentStatus.pending,
    "in_process": PaymentStatus.pending,
    "authorized": PaymentStatus.pending,
}


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)) -> dict[str, str]:
    """Receives Mercado Pago's payment notifications.

    No auth — MP calls this directly and doesn't send our bearer tokens.
    No webhook signature verification either (out of scope for this MVP):
    instead, we treat the notification purely as a hint to re-fetch the
    payment from MP's authenticated API, which is the actual source of
    truth. This also makes the handler naturally idempotent against MP's
    webhook retries, since we upsert by mp_payment_id below.
    """
    try:
        body = await request.json()
    except Exception:
        # Legacy IPN notifications send topic/id as query params with an
        # empty body instead of a JSON payload.
        body = {}
    payment_id = body.get("data", {}).get("id") or request.query_params.get("id")
    topic = body.get("type") or request.query_params.get("topic")

    if topic != "payment" or not payment_id:
        # MP also sends other notification types (e.g. merchant_order) that
        # we don't act on.
        return {"status": "ignored"}

    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    mp_payment_response = sdk.payment().get(payment_id)
    mp_payment = mp_payment_response.get("response")
    if not mp_payment:
        logger.warning("Mercado Pago webhook: could not fetch payment %s", payment_id)
        return {"status": "not_found"}

    reservation_id = mp_payment.get("external_reference")
    mp_status = mp_payment.get("status")
    internal_status = _MP_STATUS_MAP.get(mp_status, PaymentStatus.rejected)

    reservation_id_int: int | None = None
    if reservation_id is not None:
        try:
            reservation_id_int = int(reservation_id)
        except (TypeError, ValueError):
            logger.warning(
                "Mercado Pago webhook: non-numeric external_reference %r for MP payment %s",
                reservation_id,
                payment_id,
            )

    payment = db.query(Payment).filter(Payment.mp_payment_id == str(payment_id)).first()
    if not payment and reservation_id_int is not None:
        payment = db.query(Payment).filter(Payment.reservation_id == reservation_id_int).first()
    if not payment:
        logger.warning("Mercado Pago webhook: no local payment found for MP payment %s", payment_id)
        return {"status": "not_found"}

    # Only confirm the reservation when the amount actually paid matches the
    # expected deposit amount. A mismatch here is left as-is (not confirmed,
    # not auto-cancelled) since an underpayment is a case that needs human
    # investigation rather than a silent automatic decision. Currency is
    # assumed to be consistent across the app (no multi-currency support
    # elsewhere), so only the numeric amount is compared unless MP returns an
    # obviously mismatched currency_id.
    transaction_amount = mp_payment.get("transaction_amount")
    currency_id = mp_payment.get("currency_id")
    amount_matches = (
        transaction_amount is not None
        and payment.amount is not None
        and float(transaction_amount) == float(payment.amount)
        and (currency_id is None or currency_id == "ARS")
    )

    if internal_status == PaymentStatus.approved and not amount_matches:
        logger.warning(
            "Mercado Pago webhook: amount mismatch for MP payment %s (reservation %s) — "
            "expected %s, got %s (currency %s). Leaving payment/reservation unresolved.",
            payment_id,
            payment.reservation_id,
            payment.amount,
            transaction_amount,
            currency_id,
        )
        return {"status": "amount_mismatch"}

    payment.mp_payment_id = str(payment_id)
    payment.status = internal_status
    db.commit()

    reservation = db.query(Reservation).filter(Reservation.id == payment.reservation_id).first()
    if reservation and reservation.status == ReservationStatus.pending_payment:
        if internal_status == PaymentStatus.approved:
            reservation.status = ReservationStatus.confirmed
            reservation.payment_expires_at = None
        elif internal_status == PaymentStatus.rejected:
            reservation.status = ReservationStatus.cancelled
        db.commit()
    elif reservation and internal_status == PaymentStatus.approved:
        if reservation.status == ReservationStatus.cancelled:
            # The reservation was already moved out of pending_payment (e.g. the
            # TTL sweep cancelled it) before this webhook landed. We still record
            # the payment as approved above so the money isn't lost from our
            # records, but this is a support gap worth surfacing loudly: the
            # customer paid and the reservation isn't confirmed.
            logger.error(
                "Mercado Pago webhook: payment %s (MP id %s) for reservation %s approved for amount %s, "
                "but reservation status is %s (not pending_payment) — payment recorded but reservation "
                "was NOT confirmed. Needs manual follow-up.",
                payment.id,
                payment_id,
                reservation.id,
                payment.amount,
                reservation.status,
            )
        elif reservation.status == ReservationStatus.confirmed:
            # Mercado Pago routinely retries webhook delivery for the same
            # payment. The reservation is already confirmed, so this is a
            # duplicate notification, not an error — nothing to do.
            logger.info(
                "Mercado Pago webhook: duplicate/retry notification for payment %s (MP id %s), "
                "reservation %s is already confirmed. Ignoring.",
                payment.id,
                payment_id,
                reservation.id,
            )

    return {"status": "ok"}
