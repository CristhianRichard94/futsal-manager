"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import ErrorBanner from "@/components/ErrorBanner";
import { HttpService } from "@/service/HttpService";
import { Reservation, ReservationStatus } from "@/lib/types";

// Mercado Pago polling: we don't have a websocket/push channel from the
// webhook to the browser, so we poll GET /reservations/{id} for a short
// window while the webhook (which fires independently of the browser
// redirect) catches up and flips the reservation's status.
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

function ReturnContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const t = useTranslations("bookReturn");

  // MP appends `external_reference` (the reservation id we set at
  // preference creation time) to the back_urls redirect, along with its own
  // `status`/`payment_id`/`preference_id` params. We rely on
  // external_reference rather than MP's `status` param, since our own
  // GET /reservations/{id} (kept in sync by the webhook) is the source of
  // truth for the final reservation status.
  const reservationId = searchParams.get("external_reference");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!reservationId) {
      setError(true);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = () => {
      HttpService.getReservation(reservationId)
        .then((data) => {
          if (cancelled) return;
          setReservation(data);
          if (data.status === ReservationStatus.PendingPayment) {
            if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
              setTimedOut(true);
              return;
            }
            timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
          }
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reservationId]);

  if (error) {
    return <ErrorBanner message={t("timeoutDescription")} />;
  }

  if (!reservation) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (reservation.status === ReservationStatus.Confirmed) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h1 className="text-2xl font-bold">{t("approvedTitle")}</h1>
        <p className="text-muted-foreground">{t("approvedDescription")}</p>
        <div className="flex gap-3">
          <Button asChild>
            <a href="/me/bookings">{t("viewMyBookings")}</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/venues/${params.id}`}>{t("backToVenue")}</a>
          </Button>
        </div>
      </div>
    );
  }

  if (reservation.status === ReservationStatus.Cancelled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">{t("rejectedTitle")}</h1>
        <p className="text-muted-foreground">{t("rejectedDescription")}</p>
        <Button asChild>
          <a href={`/venues/${params.id}/book`}>{t("tryAgain")}</a>
        </Button>
      </div>
    );
  }

  // Still pending_payment.
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Clock className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">{t("pendingTitle")}</h1>
      <p className="text-muted-foreground">
        {timedOut ? t("timeoutDescription") : t("pendingDescription")}
      </p>
      <Button variant="outline" asChild>
        <a href={`/venues/${params.id}`}>{t("backToVenue")}</a>
      </Button>
    </div>
  );
}

export default function BookReturnPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ReturnContent />
    </Suspense>
  );
}
